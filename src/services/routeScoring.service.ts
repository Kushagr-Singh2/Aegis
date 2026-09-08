// ============================================================
// src/services/routeScoring.service.ts
// Safety Route Scoring Service.
//
// Evaluates multiple route candidates based on telemetry factors:
//   - Traffic congestion & unpredictable delay (prolonged stops increase vulnerability)
//   - Travel exposure duration (ETA)
//   - Route length and directness
//   - Density of nearby emergency assistance corridors
//
// Output Wording Requirement:
//   - Must use the wording: "Recommended safer route"
//   - Does NOT claim guaranteed safety. Includes explicit advisory notice.
// ============================================================

import type { RouteOption } from './routing.service';


export interface RouteScoringFactorsInput {
  /** Count of emergency assistance places (police, hospital) near this route corridor */
  nearbyAssistanceCount?: number;
  /** Whether the route travels primarily through well-lit main corridors / highways */
  mainCorridorPreference?: boolean;
}

export interface RouteSafetyAssessment {
  route_id: string;
  safety_score: number; // Clamped 0–100
  recommendation_label: string; // "Recommended safer route" or "Alternative route"
  factors: {
    base_score: number;
    traffic_deduction: number;
    travel_time_deduction: number;
    assistance_bonus: number;
    corridor_bonus: number;
  };
  route: RouteOption;
}

export interface SelectSaferRouteResult {
  /** The top route selected by the safety scoring model */
  recommended_route: RouteOption;
  /** Safety score of the recommended route (0–100) */
  safety_score: number;
  /** Required canonical wording */
  recommendation_wording: 'Recommended safer route';
  /** Advisory disclaimer clarifying recommendation nature */
  advisory_notice: string;
  /** Detailed scoring breakdown for all candidate routes */
  all_routes_evaluated: RouteSafetyAssessment[];
}

const SAFETY_DISCLAIMER =
  'Recommended safer route based on evaluated transit telemetry, travel time, and corridor factors. This does not represent a guarantee of personal safety.';

/**
 * Scores an individual route on a 0–100 safety scale.
 *
 * Scoring Model:
 *   - Base: 85
 *   - Traffic Delay Deduction:
 *       - None / low delay (<60s): 0
 *       - Moderate delay (60–300s): -5 to -15
 *       - High delay (>300s gridlock): -20
 *   - Travel Time Exposure Deduction:
 *       - Extended trip duration scales exposure (-1 per 5 mins over baseline)
 *   - Nearby Assistance Bonus:
 *       - Presence of police/hospitals along route: +2 per facility, max +10
 *   - Main Corridor Bonus:
 *       - Main thoroughfare / arterial road: +5
 */
export function scoreRouteSafety(
  route: RouteOption,
  options: RouteScoringFactorsInput = {}
): RouteSafetyAssessment {
  const baseScore = 85;
  let trafficDeduction = 0;
  let timeDeduction = 0;
  let assistanceBonus = 0;
  let corridorBonus = 0;

  // 1. Traffic Delay Factor (stationary vehicles in gridlock are vulnerable)
  const delaySec = route.traffic.trafficDelaySeconds;
  if (delaySec > 300) {
    trafficDeduction = 20;
  } else if (delaySec > 180) {
    trafficDeduction = 12;
  } else if (delaySec > 60) {
    trafficDeduction = 6;
  }

  // 2. Travel Time Exposure
  // Longer routes inherently increase duration in transit
  if (route.travelTimeSeconds > 2400) {
    // Over 40 minutes
    timeDeduction = 8;
  } else if (route.travelTimeSeconds > 1500) {
    // Over 25 minutes
    timeDeduction = 4;
  }

  // 3. Nearby Assistance Corridor Bonus
  if (options.nearbyAssistanceCount && options.nearbyAssistanceCount > 0) {
    assistanceBonus = Math.min(10, options.nearbyAssistanceCount * 2);
  }

  // 4. Main Corridor Preference
  if (options.mainCorridorPreference !== false) {
    corridorBonus = 5;
  }

  const rawScore =
    baseScore - trafficDeduction - timeDeduction + assistanceBonus + corridorBonus;
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    route_id: route.id,
    safety_score: clampedScore,
    recommendation_label: 'Alternative route',
    factors: {
      base_score: baseScore,
      traffic_deduction: trafficDeduction,
      travel_time_deduction: timeDeduction,
      assistance_bonus: assistanceBonus,
      corridor_bonus: corridorBonus,
    },
    route,
  };
}

/**
 * Evaluates candidate routes and selects the "Recommended safer route".
 *
 * @param routes Candidate routes (from calculateRoutes)
 * @param factors Optional corridor / assistance data per route
 * @returns SelectSaferRouteResult with recommended_route, safety_score, and advisory notice
 */
export function selectSaferRoute(
  routes: RouteOption[],
  factors: Record<string, RouteScoringFactorsInput> = {}
): SelectSaferRouteResult {
  if (!routes || routes.length === 0) {
    throw new Error('selectSaferRoute requires at least one route candidate.');
  }

  // Score all routes
  const assessments = routes.map((r) =>
    scoreRouteSafety(r, factors[r.id] || {})
  );

  // Sort descending by safety score; tiebreak by shortest travel time
  assessments.sort((a, b) => {
    if (b.safety_score !== a.safety_score) {
      return b.safety_score - a.safety_score;
    }
    return a.route.travelTimeSeconds - b.route.travelTimeSeconds;
  });

  // Top route is the recommended safer route
  assessments[0].recommendation_label = 'Recommended safer route';

  return {
    recommended_route: assessments[0].route,
    safety_score: assessments[0].safety_score,
    recommendation_wording: 'Recommended safer route',
    advisory_notice: SAFETY_DISCLAIMER,
    all_routes_evaluated: assessments,
  };
}
