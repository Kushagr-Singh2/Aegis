// ============================================================
// src/services/emergency.service.ts
// AEGIS Emergency Service.
//
// Handles emergency lifecycle:
//   - activateEmergency() (generic or sensor-triggered)
//   - triggerManualSOS() (instant SOS button press: risk=100, CRITICAL, no AI gate)
//   - getActiveEmergency()
//   - resolveEmergency()
//
// Changes are streamed in real time via Supabase Realtime.
// ============================================================

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  EmergencyEvent,
  EmergencyEventInsert,
  EmergencyEventUpdate,
  EmergencyStatus,
  RiskLevel,
  TriggerType,
} from '../types/database.types';
import { flagJourneyEmergency } from './journey.service';


export interface ActivateEmergencyParams {
  triggerType: TriggerType;
  journeyId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  riskScore?: number | null;
  riskLevel?: RiskLevel | null;
}

export interface ManualSOSParams {
  journeyId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface VoiceSOSParams {
  journeyId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  detectedPhrase?: string;
  riskScore?: number | null;
}


// ── Activate Emergency ────────────────────────────────────────

/**
 * Activates an emergency event and persists it to `emergency_events`.
 *
 * Stores:
 *   - user_id (authenticated user)
 *   - journey_id (optional)
 *   - trigger_type
 *   - risk_score
 *   - risk_level
 *   - latitude & longitude (current GPS position)
 *   - created_at (timestamp)
 *   - status: 'active'
 *
 * If a journeyId is provided, also sets the journey status to 'emergency'.
 */
export async function activateEmergency(
  params: ActivateEmergencyParams
): Promise<{ data: EmergencyEvent | null; error: unknown }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: authError ?? new Error('Not authenticated') };
  }

  const insert: EmergencyEventInsert = {
    user_id: user.id,
    journey_id: params.journeyId ?? null,
    trigger_type: params.triggerType,
    risk_score: params.riskScore ?? null,
    risk_level: params.riskLevel ?? null,
    latitude: params.latitude ?? null,
    longitude: params.longitude ?? null,
    status: 'active',
    resolved_at: null,
  };

  const { data, error } = await supabase
    .from('emergency_events')
    .insert(insert)
    .select()
    .single();

  if (!error && data && params.journeyId) {
    // Flag journey status to 'emergency'
    await flagJourneyEmergency(params.journeyId);
  }

  return { data, error };
}

/**
 * Alias for activateEmergency for backward compatibility with Phase 1.
 */
export const triggerEmergency = activateEmergency;

// ── Manual SOS ────────────────────────────────────────────────

/**
 * Triggered when user initiates a Manual SOS (e.g. SOS hardware/UI button).
 *
 * Key behaviors:
 *   1. Immediately creates an emergency_event with trigger_type: 'MANUAL_SOS'.
 *   2. Does NOT require AI confirmation or delay.
 *   3. Overrides risk score to 100 and risk level to 'CRITICAL'.
 *   4. Flags associated journey as 'emergency'.
 */
export async function triggerManualSOS(
  params: ManualSOSParams = {}
): Promise<{ data: EmergencyEvent | null; error: unknown }> {
  return activateEmergency({
    triggerType: 'MANUAL_SOS',
    journeyId: params.journeyId,
    latitude: params.latitude,
    longitude: params.longitude,
    riskScore: 100,
    riskLevel: 'CRITICAL',
  });
}

// ── Voice SOS ─────────────────────────────────────────────────

/**
 * Triggered when voice recognition detects an emergency keyword / phrase.
 *
 * Speech-to-text processing occurs on-device (Android); the backend
 * receives and processes the resulting VOICE_SOS event.
 */
export async function triggerVoiceSOS(
  params: VoiceSOSParams = {}
): Promise<{ data: EmergencyEvent | null; error: unknown }> {
  return activateEmergency({
    triggerType: 'VOICE_SOS',
    journeyId: params.journeyId,
    latitude: params.latitude,
    longitude: params.longitude,
    riskScore: params.riskScore ?? 90,
    riskLevel: 'CRITICAL',
  });
}


// ── Get Active Emergency ──────────────────────────────────────

/**
 * Returns the currently active emergency for the authenticated user,
 * or null if there is no active emergency.
 */
export async function getActiveEmergency(): Promise<{
  data: EmergencyEvent | null;
  error: unknown;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: authError ?? new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('emergency_events')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

// ── Resolve Emergency ─────────────────────────────────────────

/**
 * Resolves an active emergency.
 * Status can be set to 'resolved' (default) or 'false_alarm'.
 */
export async function resolveEmergency(
  eventId: string,
  status: Extract<EmergencyStatus, 'resolved' | 'false_alarm'> = 'resolved'
): Promise<{ data: EmergencyEvent | null; error: unknown }> {
  const update: EmergencyEventUpdate = {
    status,
    resolved_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('emergency_events')
    .update(update)
    .eq('id', eventId)
    .select()
    .single();

  return { data, error };
}

// ── Query List & Single ───────────────────────────────────────

/**
 * Returns all emergency events for the current user, newest first.
 */
export async function listEmergencyEvents(params?: {
  status?: EmergencyStatus;
  journeyId?: string;
}): Promise<{ data: EmergencyEvent[]; error: unknown }> {
  let query = supabase
    .from('emergency_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.journeyId) {
    query = query.eq('journey_id', params.journeyId);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

/**
 * Returns a single emergency event by ID.
 */
export async function getEmergencyEvent(id: string): Promise<{
  data: EmergencyEvent | null;
  error: unknown;
}> {
  const { data, error } = await supabase
    .from('emergency_events')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

// ── Realtime Subscription ─────────────────────────────────────

/**
 * Subscribes to live emergency events for the authenticated user via Supabase Realtime.
 * Fires `onEvent` on both INSERT and UPDATE events.
 *
 * Returns a cleanup function to unsubscribe.
 */
export function subscribeToEmergencies(
  onEvent: (event: EmergencyEvent) => void
): () => void {
  const channel: RealtimeChannel = supabase
    .channel('emergency_events:live')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'emergency_events',
      },
      (payload) => {
        onEvent(payload.new as EmergencyEvent);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
