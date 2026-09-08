// ============================================================
// src/services/checkIn.service.ts
// Schedule, respond to, and query journey check-ins.
//
// Safety Behavior:
//   - When a user responds safely, status becomes 'responded'.
//   - If a check-in expires without response, it is marked 'missed'.
//   - Missed check-in increases risk score (+10 per missed).
//   - Does NOT automatically place emergency calls.
// ============================================================

import { supabase } from '../lib/supabase';
import type { CheckIn, CheckInInsert, CheckInUpdate } from '../types/database.types';


export interface CreateCheckInParams {
  journeyId: string;
  /** ISO-8601 timestamp when check-in prompt should be triggered */
  scheduledAt: string;
}

// ── Create Check-in ──────────────────────────────────────────

/**
 * Creates a single check-in scheduled for a journey at a future timestamp.
 */
export async function createCheckIn(
  params: CreateCheckInParams
): Promise<{ data: CheckIn | null; error: unknown }> {
  const insert: CheckInInsert = {
    journey_id: params.journeyId,
    scheduled_at: params.scheduledAt,
    status: 'pending',
    responded_at: null,
  };

  const { data, error } = await supabase
    .from('check_ins')
    .insert(insert)
    .select()
    .single();

  return { data, error };
}

/**
 * Alias for createCheckIn for backward compatibility.
 */
export const scheduleCheckIn = createCheckIn;

/**
 * Creates multiple check-ins in a single round-trip.
 * Useful for scheduling check-ins at regular intervals across a trip.
 */
export async function scheduleCheckIns(params: {
  journeyId: string;
  scheduledTimes: string[]; // ISO-8601 array
}): Promise<{ data: CheckIn[] | null; error: unknown }> {
  if (params.scheduledTimes.length === 0) return { data: [], error: null };

  const inserts: CheckInInsert[] = params.scheduledTimes.map((t) => ({
    journey_id: params.journeyId,
    scheduled_at: t,
    status: 'pending',
    responded_at: null,
  }));

  const { data, error } = await supabase
    .from('check_ins')
    .insert(inserts)
    .select();

  return { data, error };
}

// ── Respond ───────────────────────────────────────────────────

/**
 * Marks a pending check-in as responded.
 * Call this when the user taps "I'm safe" in the app.
 */
export async function respondToCheckIn(
  checkInId: string
): Promise<{ data: CheckIn | null; error: unknown }> {
  const update: CheckInUpdate = {
    status: 'responded',
    responded_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('check_ins')
    .update(update)
    .eq('id', checkInId)
    .select()
    .single();

  return { data, error };
}

// ── Mark Missed Check-in ──────────────────────────────────────

/**
 * Marks a check-in as missed when the response timer elapses.
 * Missed check-ins increase user risk score (+10).
 * Note: Does not automatically initiate calls.
 */
export async function markMissedCheckIn(
  checkInId: string
): Promise<{ data: CheckIn | null; error: unknown }> {
  const { data, error } = await supabase
    .from('check_ins')
    .update({ status: 'missed' } as CheckInUpdate)
    .eq('id', checkInId)
    .select()
    .single();

  return { data, error };
}

/**
 * Alias for markMissedCheckIn for backward compatibility.
 */
export const markCheckInMissed = markMissedCheckIn;

// ── Query ─────────────────────────────────────────────────────

/**
 * Returns all check-ins for a journey ordered by scheduled time.
 */
export async function getJourneyCheckIns(
  journeyId: string
): Promise<{ data: CheckIn[]; error: unknown }> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('journey_id', journeyId)
    .order('scheduled_at', { ascending: true });

  return { data: data ?? [], error };
}

/**
 * Returns all pending check-ins for a journey that are overdue
 * (scheduled_at is in the past).
 */
export async function getOverdueCheckIns(
  journeyId: string
): Promise<{ data: CheckIn[]; error: unknown }> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('journey_id', journeyId)
    .eq('status', 'pending')
    .lt('scheduled_at', now)
    .order('scheduled_at', { ascending: true });

  return { data: data ?? [], error };
}

/**
 * Scans a journey for overdue check-ins and marks them as missed.
 * Returns the updated list of missed check-ins.
 */
export async function processOverdueCheckIns(
  journeyId: string
): Promise<{ data: CheckIn[]; count: number; error: unknown }> {
  const { data: overdue, error: fetchError } = await getOverdueCheckIns(journeyId);
  if (fetchError || !overdue || overdue.length === 0) {
    return { data: [], count: 0, error: fetchError };
  }

  const updated: CheckIn[] = [];
  for (const item of overdue) {
    const { data: marked } = await markMissedCheckIn(item.id);
    if (marked) updated.push(marked);
  }

  return { data: updated, count: updated.length, error: null };
}
