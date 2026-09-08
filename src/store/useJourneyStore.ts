/**
 * AEGIS Journey Store — Zustand
 *
 * Manages the entire journey lifecycle:
 *   idle → active → (sos) → arrived → idle
 *
 * Risk levels: low | medium | high
 *
 * All state mutations happen through actions.
 * Backend integration: replace action bodies with API calls.
 */

import { create } from 'zustand';

// ── Types ────────────────────────────────────────────────────────────────────

export type JourneyStatus = 'idle' | 'active' | 'sos' | 'arrived';
export type RiskLevel = 'low' | 'medium' | 'high';

export type JourneyDestination = {
  name: string;
  address: string;
  estimatedTime: string;
};

export type JourneyState = {
  // State
  status: JourneyStatus;
  destination: JourneyDestination | null;
  riskLevel: RiskLevel;
  startedAt: Date | null;
  sosTriggeredAt: Date | null;
  arrivedAt: Date | null;
  journeyId: string | null;
  sosReason: string | null;
  sharedWithContacts: boolean;

  // Actions
  startJourney: (destination: JourneyDestination) => void;
  endJourney: () => void;
  triggerSOS: (reason?: string) => void;
  cancelSOS: () => void;
  markArrived: () => void;
  setRiskLevel: (level: RiskLevel) => void;
  shareWithContacts: () => void;
  resetJourney: () => void;
};

// ── Initial state ────────────────────────────────────────────────────────────

const initialState = {
  status: 'idle' as JourneyStatus,
  destination: null,
  riskLevel: 'low' as RiskLevel,
  startedAt: null,
  sosTriggeredAt: null,
  arrivedAt: null,
  journeyId: null,
  sosReason: null,
  sharedWithContacts: false,
};

// ── Store ────────────────────────────────────────────────────────────────────

export const useJourneyStore = create<JourneyState>()((set, _get) => ({
  ...initialState,

  startJourney: (destination: JourneyDestination) => {
    console.log('[JourneyStore] Starting journey to:', destination.name);
    set({
      status: 'active',
      destination,
      riskLevel: 'low',
      startedAt: new Date(),
      sosTriggeredAt: null,
      arrivedAt: null,
      sosReason: null,
      sharedWithContacts: false,
      journeyId: `jrn_${Date.now()}`,
    });
    // TODO (backend): POST /journeys/start
  },

  endJourney: () => {
    console.log('[JourneyStore] Ending journey');
    set({
      status: 'idle',
      destination: null,
      riskLevel: 'low',
      startedAt: null,
      sosTriggeredAt: null,
      arrivedAt: null,
      journeyId: null,
      sosReason: null,
      sharedWithContacts: false,
    });
    // TODO (backend): POST /journeys/{id}/end
  },

  triggerSOS: (reason?: string) => {
    console.log('[JourneyStore] SOS triggered! Reason:', reason ?? 'none');
    set({
      status: 'sos',
      riskLevel: 'high',
      sosTriggeredAt: new Date(),
      sosReason: reason ?? null,
    });
    // TODO (backend): POST /journeys/{id}/sos
    // TODO (SMS): Send emergency SMS to trusted contacts
    // TODO (notification): Push notification to contacts
  },

  cancelSOS: () => {
    console.log('[JourneyStore] SOS cancelled');
    set((state) => ({
      status: state.destination ? 'active' : 'idle',
      sosTriggeredAt: null,
      sosReason: null,
      riskLevel: 'medium', // Stay elevated after SOS cancel
    }));
    // TODO (backend): POST /journeys/{id}/sos/cancel
  },

  markArrived: () => {
    console.log('[JourneyStore] Journey arrived');
    set({
      status: 'arrived',
      arrivedAt: new Date(),
      riskLevel: 'low',
    });
    // TODO (backend): POST /journeys/{id}/arrived
    // TODO (SMS): Notify contacts of safe arrival
  },

  setRiskLevel: (level: RiskLevel) => {
    console.log('[JourneyStore] Risk level changed to:', level);
    set({ riskLevel: level });
    // TODO (backend): real risk calculation from AI
  },

  shareWithContacts: () => {
    console.log('[JourneyStore] Sharing journey with contacts');
    set({ sharedWithContacts: true });
    // TODO (SMS): Send journey share link to trusted contacts
  },

  resetJourney: () => {
    set(initialState);
  },
}));

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectIsJourneyActive = (s: JourneyState) =>
  s.status === 'active' || s.status === 'sos';

export const selectIsSOSActive = (s: JourneyState) => s.status === 'sos';

export const selectJourneyDuration = (s: JourneyState): string => {
  if (!s.startedAt) return '--';
  const diffMs = Date.now() - s.startedAt.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just started';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return remainingMin > 0 ? `${hours}h ${remainingMin}m` : `${hours}h`;
};
