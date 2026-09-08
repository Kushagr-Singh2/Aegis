// ============================================================
// src/services/realtime.service.ts
// Supabase Realtime subscription manager.
//
// All 4 tables that have Realtime enabled:
//   ✓ journeys            (status changes — planned/active/emergency)
//   ✓ location_updates    (live GPS pings during a journey)
//   ✓ emergency_events    (SOS alerts)
//   ✓ check_ins           (scheduled safety prompts)
//
// Each subscribe* function returns an unsubscribe() function.
// Always call it on component unmount or when the subscription
// is no longer needed to avoid channel leaks.
//
// Note: Supabase Realtime respects RLS — users only receive
// events for rows they have SELECT access to.
// ============================================================

import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  CheckIn,
  EmergencyEvent,
  Journey,
  LocationUpdate,
} from '../types/database.types';


// ── Realtime event types ──────────────────────────────────────

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface SubscriptionHandle {
  /** Unsubscribes from the channel and removes it from the client. */
  unsubscribe: () => void;
}

// ── Journeys ──────────────────────────────────────────────────

/**
 * Subscribes to changes on the `journeys` table for the current user.
 *
 * Fires on INSERT and UPDATE events — useful for tracking status
 * transitions in real time (e.g. planned → active → emergency).
 *
 * @example
 * const handle = subscribeToJourneys((journey) => {
 *   if (journey.status === 'emergency') showSosOverlay();
 * });
 * // cleanup:
 * handle.unsubscribe();
 */
export function subscribeToJourneys(
  onEvent: (journey: Journey) => void,
  event: Extract<RealtimeEvent, 'INSERT' | 'UPDATE' | '*'> = '*'
): SubscriptionHandle {
  const channel: RealtimeChannel = supabase
    .channel('realtime:journeys')
    .on<Journey>(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table: 'journeys',
      },
      (payload: RealtimePostgresChangesPayload<Journey>) => {
        const row = (payload.new && Object.keys(payload.new).length > 0)
          ? (payload.new as Journey)
          : (payload.old as Journey);
        onEvent(row);
      }
    )
    .subscribe();

  return { unsubscribe: () => supabase.removeChannel(channel) };
}

/**
 * Subscribes to journey status changes only.
 * Fires `onStatusChange` when a journey's status field transitions.
 *
 * @example
 * const handle = subscribeToJourneyStatus(journeyId, (journey) => {
 *   console.log('New status:', journey.status);
 * });
 */
export function subscribeToJourneyStatus(
  journeyId: string,
  onStatusChange: (journey: Journey) => void
): SubscriptionHandle {
  const channel: RealtimeChannel = supabase
    .channel(`realtime:journeys:${journeyId}`)
    .on<Journey>(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'journeys',
        filter: `id=eq.${journeyId}`,
      },
      (payload) => {
        onStatusChange(payload.new as Journey);
      }
    )
    .subscribe();

  return { unsubscribe: () => supabase.removeChannel(channel) };
}

// ── Location Updates ──────────────────────────────────────────

/**
 * Subscribes to live GPS pings for a specific journey.
 * Fires on every INSERT into `location_updates` for that journey.
 *
 * Intended for: map views, responder tracking dashboards.
 *
 * @example
 * const handle = subscribeToLocationUpdates(journeyId, (loc) => {
 *   map.moveTo(loc.latitude, loc.longitude);
 * });
 */
export function subscribeToLocationUpdates(
  journeyId: string,
  onPing: (location: LocationUpdate) => void
): SubscriptionHandle {
  const channel: RealtimeChannel = supabase
    .channel(`realtime:location_updates:${journeyId}`)
    .on<LocationUpdate>(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'location_updates',
        filter: `journey_id=eq.${journeyId}`,
      },
      (payload) => {
        onPing(payload.new as LocationUpdate);
      }
    )
    .subscribe();

  return { unsubscribe: () => supabase.removeChannel(channel) };
}

// ── Emergency Events ──────────────────────────────────────────

/**
 * Subscribes to all emergency events for the current user.
 * Fires on INSERT (new alert) and UPDATE (status change: resolved/false_alarm).
 *
 * Intended for: SOS overlays, responder alert feeds.
 *
 * @example
 * const handle = subscribeToEmergencyEvents((event) => {
 *   if (event.status === 'active') triggerAlarm(event);
 *   if (event.status === 'resolved') clearAlarm(event.id);
 * });
 */
export function subscribeToEmergencyEvents(
  onEvent: (event: EmergencyEvent) => void
): SubscriptionHandle {
  const channel: RealtimeChannel = supabase
    .channel('realtime:emergency_events')
    .on<EmergencyEvent>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'emergency_events',
      },
      (payload) => {
        const row = (payload.new && Object.keys(payload.new).length > 0)
          ? (payload.new as EmergencyEvent)
          : (payload.old as EmergencyEvent);
        onEvent(row);
      }
    )
    .subscribe();

  return { unsubscribe: () => supabase.removeChannel(channel) };
}

/**
 * Subscribes to emergency events for a specific journey only.
 */
export function subscribeToJourneyEmergencies(
  journeyId: string,
  onEvent: (event: EmergencyEvent) => void
): SubscriptionHandle {
  const channel: RealtimeChannel = supabase
    .channel(`realtime:emergency_events:${journeyId}`)
    .on<EmergencyEvent>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'emergency_events',
        filter: `journey_id=eq.${journeyId}`,
      },
      (payload) => {
        const row = (payload.new && Object.keys(payload.new).length > 0)
          ? (payload.new as EmergencyEvent)
          : (payload.old as EmergencyEvent);
        onEvent(row);
      }
    )
    .subscribe();

  return { unsubscribe: () => supabase.removeChannel(channel) };
}

// ── Check-ins ─────────────────────────────────────────────────

/**
 * Subscribes to check-in events for a specific journey.
 * Fires when check-ins are created (INSERT) or when their
 * status changes (UPDATE: pending → responded | missed).
 *
 * Intended for: safety timer UI, responder check-in feeds.
 *
 * @example
 * const handle = subscribeToCheckIns(journeyId, (checkIn) => {
 *   if (checkIn.status === 'missed') escalateToEmergency();
 * });
 */
export function subscribeToCheckIns(
  journeyId: string,
  onEvent: (checkIn: CheckIn) => void
): SubscriptionHandle {
  const channel: RealtimeChannel = supabase
    .channel(`realtime:check_ins:${journeyId}`)
    .on<CheckIn>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'check_ins',
        filter: `journey_id=eq.${journeyId}`,
      },
      (payload) => {
        const row = (payload.new && Object.keys(payload.new).length > 0)
          ? (payload.new as CheckIn)
          : (payload.old as CheckIn);
        onEvent(row);
      }
    )
    .subscribe();

  return { unsubscribe: () => supabase.removeChannel(channel) };
}

// ── Composite: full journey session ──────────────────────────

/**
 * Convenience function — subscribes to ALL real-time events
 * for a single active journey:
 *   - journey status changes
 *   - location pings
 *   - emergency events
 *   - check-in updates
 *
 * Returns a single `unsubscribe()` that tears down all channels.
 *
 * @example
 * const handle = subscribeToJourneySession(journeyId, {
 *   onJourneyUpdate: (j) => setJourneyState(j),
 *   onLocation: (loc) => updateMap(loc),
 *   onEmergency: (e) => showSosAlert(e),
 *   onCheckIn: (c) => updateCheckInStatus(c),
 * });
 * // cleanup when journey ends or component unmounts:
 * handle.unsubscribe();
 */
export function subscribeToJourneySession(
  journeyId: string,
  handlers: {
    onJourneyUpdate?: (journey: Journey) => void;
    onLocation?: (location: LocationUpdate) => void;
    onEmergency?: (event: EmergencyEvent) => void;
    onCheckIn?: (checkIn: CheckIn) => void;
  }
): SubscriptionHandle {
  const handles: SubscriptionHandle[] = [];

  if (handlers.onJourneyUpdate) {
    handles.push(subscribeToJourneyStatus(journeyId, handlers.onJourneyUpdate));
  }
  if (handlers.onLocation) {
    handles.push(subscribeToLocationUpdates(journeyId, handlers.onLocation));
  }
  if (handlers.onEmergency) {
    handles.push(subscribeToJourneyEmergencies(journeyId, handlers.onEmergency));
  }
  if (handlers.onCheckIn) {
    handles.push(subscribeToCheckIns(journeyId, handlers.onCheckIn));
  }

  return {
    unsubscribe: () => handles.forEach((h) => h.unsubscribe()),
  };
}
