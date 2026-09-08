// ============================================================
// src/services/journey.service.ts
// Journey lifecycle management.
//
// State machine:
//   planned ──► active ──► completed
//                    └────► cancelled
//                    └────► emergency  (set by emergency.service)
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  Journey,
  JourneyInsert,
  JourneyStatus,
  JourneyUpdate,
} from '../types/database.types';

// ── Internal helper: assert authenticated ────────────────────

async function requireUser(): Promise<{ userId: string }> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');
  return { userId: user.id };
}

// ── List ─────────────────────────────────────────────────────

/**
 * Returns all journeys for the authenticated user, newest first.
 * Optionally filter by one or more statuses.
 *
 * @example
 * // All active journeys
 * const { data } = await listJourneys('active');
 *
 * // All planned + active
 * const { data } = await listJourneys(['planned', 'active']);
 */
export async function listJourneys(
  status?: JourneyStatus | JourneyStatus[]
): Promise<{ data: Journey[]; error: unknown }> {
  let query = supabase
    .from('journeys')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
    query = query.in('status', statuses);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

// ── Get single ───────────────────────────────────────────────

/**
 * Returns a single journey by ID.
 * RLS ensures only the owning user can fetch it.
 */
export async function getJourney(
  id: string
): Promise<{ data: Journey | null; error: unknown }> {
  const { data, error } = await supabase
    .from('journeys')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

// ── Get active journey ────────────────────────────────────────

/**
 * Returns the most recently started `active` journey for the
 * current user, or null if none exists.
 */
export async function getActiveJourney(): Promise<{
  data: Journey | null;
  error: unknown;
}> {
  const { data, error } = await supabase
    .from('journeys')
    .select('*')
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

// ── Create (planned) ──────────────────────────────────────────

/**
 * Creates a new journey in status `planned`.
 * Call `startJourney()` when the user is ready to begin.
 *
 * Required fields: at minimum a destination.
 * All coordinate and timing fields are optional at creation time.
 *
 * @example
 * const { data: journey } = await createJourney({
 *   destination_name: 'Home',
 *   destination_lat: 28.61,
 *   destination_lng: 77.20,
 *   expected_arrival: new Date(Date.now() + 45 * 60_000).toISOString(),
 * });
 */
export async function createJourney(
  params: Omit<JourneyInsert, 'user_id' | 'status'>
): Promise<{ data: Journey | null; error: unknown }> {
  const { userId } = await requireUser();

  const insert: JourneyInsert = {
    ...params,
    user_id: userId,
    status: 'planned',
    // started_at is intentionally null until startJourney() is called
    started_at: params.started_at ?? null,
  };

  const { data, error } = await supabase
    .from('journeys')
    .insert(insert)
    .select()
    .single();

  return { data, error };
}

// ── Start ─────────────────────────────────────────────────────

/**
 * Transitions a journey from `planned` to `active`.
 * Sets `started_at` to now (or a provided timestamp).
 *
 * Rejects if the journey is not in `planned` status.
 *
 * @example
 * const { data: activeJourney } = await startJourney(journey.id);
 */
export async function startJourney(
  id: string,
  options: {
    startedAt?: string;        // ISO-8601; defaults to now()
    expectedArrival?: string;  // ISO-8601; overwrites value set at creation
  } = {}
): Promise<{ data: Journey | null; error: unknown }> {
  // Fetch first to validate ownership and current status
  const { data: existing, error: fetchError } = await getJourney(id);

  if (fetchError || !existing) {
    return { data: null, error: fetchError ?? new Error('Journey not found') };
  }

  if (existing.status !== 'planned') {
    return {
      data: null,
      error: new Error(
        `Cannot start journey — current status is '${existing.status}'. Expected 'planned'.`
      ),
    };
  }

  const updates: JourneyUpdate = {
    status: 'active',
    started_at: options.startedAt ?? new Date().toISOString(),
  };

  if (options.expectedArrival) {
    updates.expected_arrival = options.expectedArrival;
  }

  return updateJourney(id, updates);
}

// ── Update ───────────────────────────────────────────────────

/**
 * Applies arbitrary updates to a journey.
 * RLS enforces ownership — only the owning user's rows are matched.
 */
export async function updateJourney(
  id: string,
  updates: JourneyUpdate
): Promise<{ data: Journey | null; error: unknown }> {
  const { data, error } = await supabase
    .from('journeys')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

// ── End journey ───────────────────────────────────────────────

/**
 * Marks a journey as `completed` (default) or `cancelled`
 * and records `ended_at`.
 *
 * @example
 * await endJourney(journey.id);                      // completed
 * await endJourney(journey.id, 'cancelled');          // cancelled
 */
export async function endJourney(
  id: string,
  status: Extract<JourneyStatus, 'completed' | 'cancelled'> = 'completed'
): Promise<{ data: Journey | null; error: unknown }> {
  return updateJourney(id, {
    status,
    ended_at: new Date().toISOString(),
  });
}

// ── Flag as emergency ─────────────────────────────────────────

/**
 * Sets journey status to `emergency`.
 * Called internally by `emergency.service.triggerEmergency()`.
 * Not intended to be called directly from UI code.
 */
export async function flagJourneyEmergency(
  id: string
): Promise<{ data: Journey | null; error: unknown }> {
  return updateJourney(id, { status: 'emergency' });
}
