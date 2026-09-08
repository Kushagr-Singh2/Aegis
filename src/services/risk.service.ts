// ============================================================
// src/services/risk.service.ts
// AEGIS Safety Engine — Risk Assessment Service.
//
// Calculates a 0–100 weighted risk score based on multi-factor
// telemetry signals and classifies risk level into:
//   0–29:   LOW
//   30–59:  MODERATE
//   60–79:  HIGH
//   80–100: CRITICAL
//
// Weighted Signal Model:
//   - route deviation:      +20
//   - long deviation:       +10  (duration >= 300s or explicit flag)
//   - motion anomaly:       +20
//   - sudden stop:          +15
//   - speed change:         +10
//   - missed check-in:      +10  (each or boolean)
//   - voice SOS:            +30
//   - manual SOS:           Overrides risk score directly to 100 (CRITICAL)
// ============================================================

import type { RiskLevel } from '../types/database.types';

export interface RiskSignals {
  /** True if the user has drifted beyond the allowed route corridor */
  route_deviation?: boolean;
  /** Duration in seconds that the user has been deviated from route */
  deviation_duration?: number;
  /** Explicit override for long deviation */
  long_deviation?: boolean;
  /** Accelerometer / gyroscope anomaly detected */
  motion_anomaly?: boolean;
  /** Abrupt deceleration or impact stop detected */
  sudden_stop?: boolean;
  /** Significant unexplained speed deviation */
  speed_change?: boolean;
  /** Count of missed check-ins or boolean indicating at least one missed */
  missed_checkins?: number | boolean;
  /** Voice recognition detected distress trigger phrase */
  voice_sos?: boolean;
  /** User pressed physical / on-screen manual SOS button */
  manual_sos?: boolean;
}

export interface RiskBreakdown {
  route_deviation: number;
  long_deviation: number;
  motion_anomaly: number;
  sudden_stop: number;
  speed_change: number;
  missed_checkins: number;
  voice_sos: number;
  manual_sos: number;
}

export type RiskLevelCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskAssessment {
  risk_score: number; // Clamped to 0–100
  risk_level: RiskLevelCategory;
  /** Lowercase/database-compatible level */
  risk_level_db: RiskLevel;
  breakdown: RiskBreakdown;
  signals: RiskSignals;
  /** Indicates whether an emergency should be raised based on threshold or explicit SOS */
  is_critical: boolean;
}

/** Threshold in seconds above which a route deviation is considered "long deviation" (5 mins). */
export const LONG_DEVIATION_THRESHOLD_SECONDS = 300;

/**
 * Maps a numeric score (0–100) to its corresponding category.
 *   0–29   → LOW
 *   30–59  → MODERATE
 *   60–79  → HIGH
 *   80–100 → CRITICAL
 */
export function mapScoreToRiskLevel(score: number): RiskLevelCategory {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped < 30) return 'LOW';
  if (clamped < 60) return 'MODERATE';
  if (clamped < 80) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Computes the weighted risk score and level from input safety signals.
 *
 * Rules:
 *   1. Manual SOS immediately overrides the score to 100 (CRITICAL).
 *   2. Signals are weighted and summed, then clamped to [0, 100].
 *   3. Missed check-ins add +10 per missed check-in (or +10 if boolean true).
 *   4. Long deviation adds +10 if duration >= 300s or long_deviation is true.
 */
export function calculateRisk(signals: RiskSignals): RiskAssessment {
  const breakdown: RiskBreakdown = {
    route_deviation: 0,
    long_deviation: 0,
    motion_anomaly: 0,
    sudden_stop: 0,
    speed_change: 0,
    missed_checkins: 0,
    voice_sos: 0,
    manual_sos: 0,
  };

  // Rule: Manual SOS overrides risk score directly to 100
  if (signals.manual_sos) {
    breakdown.manual_sos = 100;
    return {
      risk_score: 100,
      risk_level: 'CRITICAL',
      risk_level_db: 'critical',
      breakdown,
      signals,
      is_critical: true,
    };
  }

  let totalScore = 0;

  // 1. Route deviation (+20)
  if (signals.route_deviation) {
    breakdown.route_deviation = 20;
    totalScore += 20;
  }

  // 2. Long deviation (+10)
  const isLongDeviation =
    signals.long_deviation === true ||
    (typeof signals.deviation_duration === 'number' &&
      signals.deviation_duration >= LONG_DEVIATION_THRESHOLD_SECONDS);

  if (isLongDeviation) {
    breakdown.long_deviation = 10;
    totalScore += 10;
  }

  // 3. Motion anomaly (+20)
  if (signals.motion_anomaly) {
    breakdown.motion_anomaly = 20;
    totalScore += 20;
  }

  // 4. Sudden stop (+15)
  if (signals.sudden_stop) {
    breakdown.sudden_stop = 15;
    totalScore += 15;
  }

  // 5. Speed change (+10)
  if (signals.speed_change) {
    breakdown.speed_change = 10;
    totalScore += 10;
  }

  // 6. Missed check-in (+10)
  if (typeof signals.missed_checkins === 'number') {
    const points = Math.max(0, signals.missed_checkins) * 10;
    breakdown.missed_checkins = points;
    totalScore += points;
  } else if (signals.missed_checkins === true) {
    breakdown.missed_checkins = 10;
    totalScore += 10;
  }

  // 7. Voice SOS (+30)
  if (signals.voice_sos) {
    breakdown.voice_sos = 30;
    totalScore += 30;
  }

  // Clamp score to 0–100
  const clampedScore = Math.max(0, Math.min(100, totalScore));
  const level = mapScoreToRiskLevel(clampedScore);

  return {
    risk_score: clampedScore,
    risk_level: level,
    risk_level_db: level.toLowerCase() as RiskLevel,
    breakdown,
    signals,
    is_critical: clampedScore >= 80,
  };
}

/**
 * Convenience helper to count missed check-ins for a journey and compute
 * current journey risk signals from DB state combined with client telemetry.
 */
export async function evaluateJourneyRisk(params: {
  journeyId: string;
  telemetrySignals?: Omit<RiskSignals, 'missed_checkins'>;
}): Promise<{ data: RiskAssessment | null; error: unknown }> {
  try {
    const { supabase } = await import('../lib/supabase');
    // Fetch missed check-ins count for the journey
    const { count, error } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('journey_id', params.journeyId)
      .eq('status', 'missed');

    if (error) {
      return { data: null, error };
    }

    const signals: RiskSignals = {
      ...params.telemetrySignals,
      missed_checkins: count ?? 0,
    };

    const assessment = calculateRisk(signals);
    return { data: assessment, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
