// ============================================================
// src/services/location.service.ts
// Record GPS pings during a journey and subscribe to
// real-time location updates via Supabase Realtime.
//
// Security model (defense in depth):
//   1. Service-layer check  — `saveLocationUpdate()` fetches the
//      journey first and verifies auth.uid() === journey.user_id
//      before inserting. Rejects unknown or cross-user journeys.
//   2. RLS policy           — `location_updates: insert own`
//      enforces the same check at the database level.
//      Both layers must pass for a write to succeed.
// ============================================================

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { LocationUpdate, LocationUpdateInsert } from '../types/database.types';


// ── Types ────────────────────────────────────────────────────

export interface SaveLocationParams {
  journey_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
}

// ── Ownership validation helper ───────────────────────────────

/**
 * Verifies that the given journey exists and belongs to the
 * currently authenticated user.
 *
 * Returns the journey id on success, throws on failure.
 * This is a service-layer guard — RLS provides a second layer.
 */
async function assertJourneyOwnership(journeyId: string): Promise<void> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // We select only id; RLS will filter out rows that don't belong
  // to this user, so a missing row means either not found OR not owned.
  const { data: journey, error: fetchError } = await supabase
    .from('journeys')
    .select('id, user_id, status')
    .eq('id', journeyId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to verify journey ownership: ${fetchError.message}`);
  }

  if (!journey) {
    throw new Error(`Journey '${journeyId}' not found or does not belong to the current user`);
  }

  // Explicit double-check (belt-and-suspenders, even though RLS should block it)
  if (journey.user_id !== user.id) {
    throw new Error('Forbidden: journey belongs to a different user');
  }

  if (journey.status !== 'active') {
    throw new Error(
      `Cannot save location — journey status is '${journey.status}'. Must be 'active'.`
    );
  }
}

// ── saveLocationUpdate ────────────────────────────────────────

/**
 * PRIMARY write function for Phase 2.
 *
 * Saves a single GPS location ping for an active journey.
 * Validates that:
 *   - The user is authenticated
 *   - The journey exists and belongs to the current user
 *   - The journey is currently `active`
 *
 * Throws on validation failure; returns the inserted row on success.
 *
 * @example
 * const { data } = await saveLocationUpdate({
 *   journey_id: 'uuid-here',
 *   latitude: 28.6139,
 *   longitude: 77.2090,
 *   accuracy: 5,
 *   speed: 12.5,
 *   heading: 180,
 * });
 */
export async function saveLocationUpdate(
  params: SaveLocationParams
): Promise<{ data: LocationUpdate | null; error: unknown }> {
  try {
    await assertJourneyOwnership(params.journey_id);
  } catch (err) {
    return { data: null, error: err };
  }

  const insert: LocationUpdateInsert = {
    journey_id: params.journey_id,
    latitude: params.latitude,
    longitude: params.longitude,
    accuracy: params.accuracy ?? null,
    speed: params.speed ?? null,
    heading: params.heading ?? null,
  };

  const { data, error } = await supabase
    .from('location_updates')
    .insert(insert)
    .select()
    .single();

  return { data, error };
}

// ── Batch save ────────────────────────────────────────────────

/**
 * Saves multiple location pings for an active journey in a single
 * round-trip. Ownership is validated once before the batch insert.
 *
 * Useful for buffered/offline scenarios where pings accumulated
 * while the device was offline.
 *
 * @example
 * await saveLocationUpdateBatch([
 *   { journey_id, latitude: 28.61, longitude: 77.20 },
 *   { journey_id, latitude: 28.60, longitude: 77.19 },
 * ]);
 */
export async function saveLocationUpdateBatch(
  pings: SaveLocationParams[]
): Promise<{ data: LocationUpdate[] | null; error: unknown }> {
  if (pings.length === 0) return { data: [], error: null };

  // All pings must be for the same journey (validate once)
  const journeyIds = [...new Set(pings.map((p) => p.journey_id))];

  if (journeyIds.length > 1) {
    return {
      data: null,
      error: new Error('All pings in a batch must belong to the same journey'),
    };
  }

  try {
    await assertJourneyOwnership(journeyIds[0]);
  } catch (err) {
    return { data: null, error: err };
  }

  const inserts: LocationUpdateInsert[] = pings.map((p) => ({
    journey_id: p.journey_id,
    latitude: p.latitude,
    longitude: p.longitude,
    accuracy: p.accuracy ?? null,
    speed: p.speed ?? null,
    heading: p.heading ?? null,
  }));

  const { data, error } = await supabase
    .from('location_updates')
    .insert(inserts)
    .select();

  return { data, error };
}

// ── Read ──────────────────────────────────────────────────────

/**
 * Returns all recorded location updates for a journey,
 * ordered chronologically (oldest first).
 * RLS ensures the caller can only fetch their own journey's data.
 */
export async function getJourneyLocations(
  journeyId: string
): Promise<{ data: LocationUpdate[]; error: unknown }> {
  const { data, error } = await supabase
    .from('location_updates')
    .select('*')
    .eq('journey_id', journeyId)
    .order('created_at', { ascending: true });

  return { data: data ?? [], error };
}

/**
 * Returns the most recent location ping for a journey.
 */
export async function getLatestLocation(
  journeyId: string
): Promise<{ data: LocationUpdate | null; error: unknown }> {
  const { data, error } = await supabase
    .from('location_updates')
    .select('*')
    .eq('journey_id', journeyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

// ── Realtime subscription ─────────────────────────────────────

/**
 * Subscribes to live location updates for a specific journey.
 * Fires `onUpdate` whenever a new row is inserted.
 *
 * Returns a cleanup function — call it to unsubscribe.
 *
 * @example
 * const unsub = subscribeToJourneyLocations(journeyId, (loc) => {
 *   map.updateMarker(loc.latitude, loc.longitude);
 * });
 * // on unmount / journey end:
 * unsub();
 */
export function subscribeToJourneyLocations(
  journeyId: string,
  onUpdate: (location: LocationUpdate) => void
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`location_updates:journey_id=eq.${journeyId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'location_updates',
        filter: `journey_id=eq.${journeyId}`,
      },
      (payload) => {
        onUpdate(payload.new as LocationUpdate);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ── Backward-compat alias ─────────────────────────────────────

/**
 * @deprecated Use `saveLocationUpdate()` instead — it adds
 * explicit ownership validation on top of RLS.
 */
export const recordLocation = saveLocationUpdate;

/** @deprecated Use `saveLocationUpdateBatch()` instead. */
export const recordLocationBatch = saveLocationUpdateBatch;
