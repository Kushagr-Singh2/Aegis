// ============================================================
// src/services/aiSummary.service.ts
// AI Emergency Situation Summarizer — "Explain My Situation".
//
// Synthesizes raw safety telemetry into a concise, factual briefing
// for users, trusted contacts, and emergency responders.
//
// ⚠️  CRITICAL DESIGN RULES:
//   1. The AI must NOT decide whether an emergency exists.
//   2. It strictly explains and contextualizes existing safety signals.
//   3. Deterministic fallback produces an identical, high-accuracy
//      factual summary if AI APIs are offline or unconfigured.
// ============================================================

export interface SituationTelemetryInput {
  journey?: {
    id?: string;
    destination_name?: string | null;
    status?: string;
    started_at?: string | null;
  } | null;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  routeDeviation?: {
    deviation_detected: boolean;
    distance_from_route?: number; // meters
    deviation_duration?: number; // seconds
  } | null;
  missedCheckIns?: number | boolean;
  motionAnomalies?: {
    motion_anomaly?: boolean;
    sudden_stop?: boolean;
    speed_change?: boolean;
  } | null;
  emergencyTrigger?: string | null;
  nearestAssistance?: {
    name: string;
    type: 'police' | 'hospital' | 'public_place';
    distanceMeters: number;
  } | null;
}

export interface ExplainSituationResult {
  summary: string;
  source: 'gemini_ai' | 'deterministic_engine';
  generatedAt: string;
  signalsSummary: {
    riskScore: number;
    riskLevel: string;
    trigger: string | null;
    routeDeviated: boolean;
    missedCheckInsCount: number;
    motionAnomalyDetected: boolean;
  };
}

/**
 * Deterministic rules-based situation summary generator.
 * Produces crisp, factual, non-hallucinated telemetry briefings.
 */
export function generateDeterministicSummary(
  input: SituationTelemetryInput
): string {
  const parts: string[] = [];

  // 1. Severity & Trigger Headline
  const trigger = input.emergencyTrigger;
  if (trigger === 'MANUAL_SOS' || trigger === 'manual_sos') {
    parts.push('Manual SOS triggered by user.');
  } else if (trigger === 'VOICE_SOS' || trigger === 'voice_sos') {
    parts.push('Voice SOS distress phrase detected.');
  } else if (input.riskLevel === 'CRITICAL' || input.riskScore >= 80) {
    parts.push('Critical safety alert active.');
  } else if (input.riskLevel === 'HIGH' || input.riskScore >= 60) {
    parts.push('High-risk journey detected.');
  } else if (input.riskLevel === 'MODERATE') {
    parts.push('Moderate risk detected on current route.');
  } else {
    parts.push('Standard journey monitoring active.');
  }

  // 2. Route & Journey context
  const dest = input.journey?.destination_name;
  if (dest) {
    parts.push(`User en route to ${dest}.`);
  }

  // 3. Route Deviation
  if (input.routeDeviation?.deviation_detected) {
    const dist = input.routeDeviation.distance_from_route;
    const durSec = input.routeDeviation.deviation_duration;
    if (dist !== undefined && dist > 0) {
      const durText = durSec && durSec > 0 ? ` for ${Math.round(durSec / 60)} minutes` : '';
      parts.push(
        `The user deviated approximately ${Math.round(dist)} metres from the planned route${durText}.`
      );
    } else {
      parts.push('Route deviation detected away from planned corridor.');
    }
  }

  // 4. Check-Ins
  const missedCount =
    typeof input.missedCheckIns === 'number'
      ? input.missedCheckIns
      : input.missedCheckIns === true
      ? 1
      : 0;

  if (missedCount > 0) {
    parts.push(
      missedCount === 1
        ? 'A safety check-in was missed without response.'
        : `${missedCount} consecutive safety check-ins were missed.`
    );
  }

  // 5. Motion Anomalies
  const motion = input.motionAnomalies;
  if (motion?.sudden_stop && motion?.motion_anomaly) {
    parts.push('Sudden deceleration and abnormal movement were detected.');
  } else if (motion?.sudden_stop) {
    parts.push('Sudden deceleration detected.');
  } else if (motion?.motion_anomaly) {
    parts.push('Abnormal motion telemetry detected.');
  } else if (motion?.speed_change) {
    parts.push('Unexplained speed change detected.');
  }

  // 6. Current Score & Level
  parts.push(
    `Current risk score is ${input.riskScore}/100 (${input.riskLevel}).`
  );

  // 7. Nearest Assistance
  if (input.nearestAssistance) {
    const typeLabel =
      input.nearestAssistance.type === 'police'
        ? 'police station'
        : input.nearestAssistance.type === 'hospital'
        ? 'hospital'
        : 'public refuge';
    parts.push(
      `The nearest ${typeLabel} (${input.nearestAssistance.name}) is approximately ${Math.round(
        input.nearestAssistance.distanceMeters
      )} metres away.`
    );
  }

  return parts.join(' ');
}

/**
 * Explains the current emergency situation from all telemetry signals.
 * Uses Gemini AI when configured, otherwise falls back gracefully
 * to the deterministic rules engine.
 */
export async function explainMySituation(
  input: SituationTelemetryInput
): Promise<ExplainSituationResult> {
  const missedCount =
    typeof input.missedCheckIns === 'number'
      ? input.missedCheckIns
      : input.missedCheckIns === true
      ? 1
      : 0;

  const motionDetected = Boolean(
    input.motionAnomalies?.motion_anomaly ||
      input.motionAnomalies?.sudden_stop ||
      input.motionAnomalies?.speed_change
  );

  const signalsSummary = {
    riskScore: input.riskScore,
    riskLevel: input.riskLevel,
    trigger: input.emergencyTrigger ?? null,
    routeDeviated: Boolean(input.routeDeviation?.deviation_detected),
    missedCheckInsCount: missedCount,
    motionAnomalyDetected: motionDetected,
  };

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-gemini-api-key-here') {
    return {
      summary: generateDeterministicSummary(input),
      source: 'deterministic_engine',
      generatedAt: new Date().toISOString(),
      signalsSummary,
    };
  }

  try {
    const prompt = `
You are a factual emergency telemetry summarizer for Aegis safety platform.
CRITICAL INSTRUCTION: You do NOT determine or decide whether an emergency exists.
You only synthesize the provided sensor, location, and risk signals into a concise 2-3 sentence factual briefing.
State the facts directly without speculation.

Telemetry Signals:
- Risk Score: ${input.riskScore}/100 (${input.riskLevel})
- Emergency Trigger: ${input.emergencyTrigger || 'None'}
- Destination: ${input.journey?.destination_name || 'Not specified'}
- Current GPS: ${input.currentLocation.latitude.toFixed(5)}, ${input.currentLocation.longitude.toFixed(5)}
- Route Deviation: ${
      input.routeDeviation?.deviation_detected
        ? `Deviated by ~${Math.round(input.routeDeviation.distance_from_route || 0)}m`
        : 'On route'
    }
- Missed Check-ins: ${missedCount}
- Motion Anomaly: ${motionDetected ? 'Detected' : 'None'}
- Nearest Facility: ${
      input.nearestAssistance
        ? `${input.nearestAssistance.name} (~${Math.round(input.nearestAssistance.distanceMeters)}m)`
        : 'None specified'
    }
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 150,
        },
      }),
    });

    if (!response.ok) {
      console.warn(`[AI Summary] Gemini API HTTP ${response.status}, using deterministic engine.`);
      return {
        summary: generateDeterministicSummary(input),
        source: 'deterministic_engine',
        generatedAt: new Date().toISOString(),
        signalsSummary,
      };
    }

    const data: any = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!candidateText) {
      return {
        summary: generateDeterministicSummary(input),
        source: 'deterministic_engine',
        generatedAt: new Date().toISOString(),
        signalsSummary,
      };
    }

    return {
      summary: candidateText,
      source: 'gemini_ai',
      generatedAt: new Date().toISOString(),
      signalsSummary,
    };
  } catch (err) {
    console.warn('[AI Summary] Exception in AI service, using deterministic engine:', err);
    return {
      summary: generateDeterministicSummary(input),
      source: 'deterministic_engine',
      generatedAt: new Date().toISOString(),
      signalsSummary,
    };
  }
}
