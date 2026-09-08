/**
 * AEGIS Journey Store — Zustand
 *
 * Manages the entire journey lifecycle:
 *   idle → active → (sos) → arrived → idle
 *
 * Risk levels:
 *   0–29 LOW
 *   30–59 MODERATE
 *   60–79 HIGH
 *   80–100 CRITICAL
 *
 * Manual SOS overrides AI risk (forces 87/100 CRITICAL).
 */

import { create } from 'zustand';
import type {
  MockRoute,
  SafetyScenario,
  NearbyHelpPlace,
  VoiceSOSState,
} from '../lib/mockData';

// ── Types ────────────────────────────────────────────────────────────────────

export type JourneyStatus = 'idle' | 'active' | 'sos' | 'arrived';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type EmergencyStatus = 'IDLE' | 'CONFIRMING' | 'COUNTDOWN' | 'ACTIVE' | 'RESOLVED';
export type CheckInStatus = 'idle' | 'prompted' | 'recorded' | 'missed';

export type SafetySignals = {
  journeyActive: boolean;
  routeDeviation: boolean;
  normalMovement: boolean;
  checkInCompleted: boolean;
};

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
  riskScore: number;
  signals: SafetySignals;
  checkInStatus: CheckInStatus;
  emergencyStatus: EmergencyStatus;
  startedAt: Date | null;
  sosTriggeredAt: Date | null;
  arrivedAt: Date | null;
  journeyId: string | null;
  sosReason: string | null;
  sharedWithContacts: boolean;
  selectedRoute: MockRoute | null;
  safetyScenario: SafetyScenario;
  // Phase 4
  selectedHelpPlace: NearbyHelpPlace | null;
  voiceSOSState: VoiceSOSState;

  // Actions
  startJourney: (destination: JourneyDestination) => void;
  endJourney: () => void;
  triggerSOS: (reason?: string) => void;
  cancelSOS: () => void;
  markArrived: () => void;
  setRiskLevel: (level: RiskLevel) => void;
  shareWithContacts: () => void;
  resetJourney: () => void;
  setSelectedRoute: (route: MockRoute | null) => void;
  setSafetyScenario: (scenario: SafetyScenario) => void;

  // Phase 3 Actions
  updateSignal: (key: keyof SafetySignals, value: boolean) => void;
  promptCheckIn: () => void;
  recordCheckInSafe: () => void;
  triggerMissedCheckIn: () => void;
  startSOSConfirmation: () => void;
  startSOSCountdown: () => void;
  cancelSOSCountdown: () => void;
  confirmSOS: (reason?: string) => void;
  resolveEmergency: () => void;

  // Phase 4 Actions
  setSelectedHelpPlace: (place: NearbyHelpPlace | null) => void;
  setVoiceSOSState: (state: VoiceSOSState) => void;
};

// ── Helper: calculate risk score & level from signals ───────────────────────

export function calculateRiskFromSignals(signals: SafetySignals): { score: number; level: RiskLevel } {
  if (!signals.journeyActive) {
    return { score: 10, level: 'low' };
  }

  let score = 15; // base baseline
  if (signals.routeDeviation) score += 32;
  if (!signals.normalMovement) score += 28;
  if (!signals.checkInCompleted) score += 20;

  score = Math.min(Math.max(score, 10), 95);

  let level: RiskLevel = 'low';
  if (score >= 80) level = 'critical';
  else if (score >= 60) level = 'high';
  else if (score >= 30) level = 'moderate';
  else level = 'low';

  return { score, level };
}

// ── Initial state ────────────────────────────────────────────────────────────

const initialSignals: SafetySignals = {
  journeyActive: false,
  routeDeviation: false,
  normalMovement: true,
  checkInCompleted: true,
};

const initialState = {
  status: 'idle' as JourneyStatus,
  destination: null,
  riskLevel: 'low' as RiskLevel,
  riskScore: 12,
  signals: initialSignals,
  checkInStatus: 'idle' as CheckInStatus,
  emergencyStatus: 'IDLE' as EmergencyStatus,
  startedAt: null,
  sosTriggeredAt: null,
  arrivedAt: null,
  journeyId: null,
  sosReason: null,
  sharedWithContacts: false,
  selectedRoute: null,
  safetyScenario: 'normal' as SafetyScenario,
  selectedHelpPlace: null as NearbyHelpPlace | null,
  voiceSOSState: 'IDLE' as VoiceSOSState,
};

// ── Store ────────────────────────────────────────────────────────────────────

export const useJourneyStore = create<JourneyState>()((set, get) => ({
  ...initialState,

  startJourney: (destination: JourneyDestination) => {
    console.log('[JourneyStore] Starting journey to:', destination.name);
    const newSignals: SafetySignals = {
      journeyActive: true,
      routeDeviation: false,
      normalMovement: true,
      checkInCompleted: true,
    };
    const { score, level } = calculateRiskFromSignals(newSignals);

    set({
      status: 'active',
      destination,
      riskLevel: level,
      riskScore: score,
      signals: newSignals,
      checkInStatus: 'idle',
      emergencyStatus: 'IDLE',
      startedAt: new Date(),
      sosTriggeredAt: null,
      arrivedAt: null,
      sosReason: null,
      sharedWithContacts: false,
      journeyId: `jrn_${Date.now()}`,
      safetyScenario: 'normal',
    });
  },

  endJourney: () => {
    console.log('[JourneyStore] Ending journey');
    set({
      ...initialState,
    });
  },

  triggerSOS: (reason?: string) => {
    console.log('[JourneyStore] SOS triggered (Manual Override)! Reason:', reason ?? 'none');
    // Manual SOS overrides AI risk
    set({
      status: 'sos',
      emergencyStatus: 'ACTIVE',
      riskScore: 87,
      riskLevel: 'critical',
      sosTriggeredAt: new Date(),
      sosReason: reason ?? 'Manual SOS Trigger',
    });
  },

  cancelSOS: () => {
    console.log('[JourneyStore] SOS cancelled');
    const { destination, signals } = get();
    const { score } = calculateRiskFromSignals(signals);
    set({
      status: destination ? 'active' : 'idle',
      emergencyStatus: 'IDLE',
      sosTriggeredAt: null,
      sosReason: null,
      riskScore: Math.min(score, 45),
      riskLevel: 'moderate', // Elevated after SOS cancel
    });
  },

  markArrived: () => {
    console.log('[JourneyStore] Journey arrived');
    set({
      status: 'arrived',
      emergencyStatus: 'IDLE',
      arrivedAt: new Date(),
      riskScore: 8,
      riskLevel: 'low',
    });
  },

  setRiskLevel: (level: RiskLevel) => {
    console.log('[JourneyStore] Risk level changed to:', level);
    const scoreMap: Record<RiskLevel, number> = {
      low: 18,
      moderate: 42,
      high: 68,
      critical: 87,
    };
    set({ riskLevel: level, riskScore: scoreMap[level] });
  },

  shareWithContacts: () => {
    console.log('[JourneyStore] Sharing journey with contacts');
    set({ sharedWithContacts: true });
  },

  resetJourney: () => {
    set(initialState);
  },

  setSelectedRoute: (route: MockRoute | null) => {
    console.log('[JourneyStore] Route selected:', route ? route.label : 'none');
    set({ selectedRoute: route });
  },

  setSafetyScenario: (scenario: SafetyScenario) => {
    console.log('[JourneyStore] Safety scenario changed to:', scenario);
    const { signals } = get();
    const updatedSignals: SafetySignals = {
      ...signals,
      journeyActive: true,
      routeDeviation: scenario === 'route_deviation' || scenario === 'critical',
      normalMovement: scenario !== 'motion_anomaly' && scenario !== 'critical',
      checkInCompleted: scenario !== 'missed_checkin',
    };

    if (scenario === 'critical') {
      // Manual/Critical overrides
      set({
        safetyScenario: scenario,
        signals: updatedSignals,
        riskScore: 87,
        riskLevel: 'critical',
        checkInStatus: 'missed',
      });
      return;
    }

    const { score, level } = calculateRiskFromSignals(updatedSignals);
    set({
      safetyScenario: scenario,
      signals: updatedSignals,
      riskScore: score,
      riskLevel: level,
      checkInStatus: scenario === 'missed_checkin' ? 'missed' : 'recorded',
    });
  },

  // ── Phase 3 Actions ────────────────────────────────────────────────────────

  updateSignal: (key: keyof SafetySignals, value: boolean) => {
    const { signals, status } = get();
    const newSignals = { ...signals, [key]: value };
    if (status === 'sos') {
      // Manual SOS overrides AI risk score
      set({ signals: newSignals });
      return;
    }
    const { score, level } = calculateRiskFromSignals(newSignals);
    console.log(`[JourneyStore] Signal ${key} = ${value} → Score ${score} (${level})`);
    set({ signals: newSignals, riskScore: score, riskLevel: level });
  },

  promptCheckIn: () => {
    console.log('[JourneyStore] Prompting safety check-in');
    set({ checkInStatus: 'prompted' });
  },

  recordCheckInSafe: () => {
    console.log('[JourneyStore] Safety check-in recorded safe');
    const { signals, status } = get();
    const newSignals = { ...signals, checkInCompleted: true };
    if (status === 'sos') {
      set({ checkInStatus: 'recorded', signals: newSignals });
      return;
    }
    const { score, level } = calculateRiskFromSignals(newSignals);
    set({
      checkInStatus: 'recorded',
      signals: newSignals,
      riskScore: score,
      riskLevel: level,
    });
  },

  triggerMissedCheckIn: () => {
    console.log('[JourneyStore] Safety check-in missed — increasing risk');
    const { signals, status } = get();
    const newSignals = { ...signals, checkInCompleted: false };
    if (status === 'sos') {
      set({ checkInStatus: 'missed', signals: newSignals });
      return;
    }
    const { score, level } = calculateRiskFromSignals(newSignals);
    set({
      checkInStatus: 'missed',
      signals: newSignals,
      riskScore: Math.min(score + 20, 78), // elevated to high
      riskLevel: 'high',
    });
  },

  startSOSConfirmation: () => {
    console.log('[JourneyStore] Starting SOS confirmation step');
    set({ emergencyStatus: 'CONFIRMING' });
  },

  startSOSCountdown: () => {
    console.log('[JourneyStore] Starting SOS 3-second countdown');
    set({ emergencyStatus: 'COUNTDOWN' });
  },

  cancelSOSCountdown: () => {
    console.log('[JourneyStore] Cancelled SOS countdown');
    set({ emergencyStatus: 'IDLE' });
  },

  confirmSOS: (reason?: string) => {
    console.log('[JourneyStore] Confirmed SOS — Emergency Active');
    // Manual SOS overrides AI risk
    set({
      status: 'sos',
      emergencyStatus: 'ACTIVE',
      riskScore: 87,
      riskLevel: 'critical',
      sosTriggeredAt: new Date(),
      sosReason: reason ?? 'Manual SOS Triggered',
    });
  },

  resolveEmergency: () => {
    console.log('[JourneyStore] Emergency resolved by user');
    const { destination } = get();
    set({
      status: destination ? 'active' : 'idle',
      emergencyStatus: 'RESOLVED',
      sosTriggeredAt: null,
      sosReason: null,
      riskScore: 24,
      riskLevel: 'low',
    });
  },

  setSelectedHelpPlace: (place) => {
    console.log('[JourneyStore] Selected nearby help place:', place?.name ?? 'none');
    set({ selectedHelpPlace: place });
  },

  setVoiceSOSState: (state) => {
    console.log('[JourneyStore] Voice SOS state:', state);
    set({ voiceSOSState: state });
  },
}));

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectIsJourneyActive = (s: JourneyState) =>
  s.status === 'active' || s.status === 'sos';

export const selectIsSOSActive = (s: JourneyState) =>
  s.status === 'sos' || s.emergencyStatus === 'ACTIVE';

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
