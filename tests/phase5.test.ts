// ============================================================
// tests/phase5.test.ts
// Verification test suite for AEGIS Phase 5:
// AI Situation Summary, Voice SOS, Trusted Contact Alerts, 112 Dispatch & Responder Dossier
// ============================================================

import assert from 'node:assert';
import {
  explainMySituation,
  generateDeterministicSummary,
  type SituationTelemetryInput,
} from '../src/services/aiSummary.service.ts';
import {
  formatEmergencyAlertMessage,
} from '../src/services/alert.service.ts';
import {
  getEmergencyDialPayload,
} from '../src/services/responder.service.ts';

console.log('🧪 Starting Phase 5 AI, Alerts & Responder Tests...\n');

// ────────────────────────────────────────────────────────────
// 1. AI SITUATION SUMMARY TESTS ("Explain My Situation")
// ────────────────────────────────────────────────────────────
console.log('--- 1. Testing AI Situation Summary ("Explain My Situation") ---');

const sampleTelemetry: SituationTelemetryInput = {
  journey: {
    id: 'j-101',
    destination_name: 'Noida Sector 18',
    status: 'active',
    started_at: '2026-09-08T12:00:00Z',
  },
  currentLocation: {
    latitude: 28.6139,
    longitude: 77.2090,
  },
  riskScore: 87,
  riskLevel: 'CRITICAL',
  emergencyTrigger: 'MANUAL_SOS',
  routeDeviation: {
    deviation_detected: true,
    distance_from_route: 180,
    deviation_duration: 360,
  },
  missedCheckIns: 1,
  motionAnomalies: {
    motion_anomaly: true,
    sudden_stop: true,
    speed_change: false,
  },
  nearestAssistance: {
    name: 'Connaught Place Police Station',
    type: 'police',
    distanceMeters: 800,
  },
};

// Test 1.1: Deterministic summary includes all required factual signals
{
  const summary = generateDeterministicSummary(sampleTelemetry);

  assert.ok(summary.includes('Manual SOS'), 'Must include trigger');
  assert.ok(summary.includes('Noida Sector 18'), 'Must include destination');
  assert.ok(summary.includes('180 metres'), 'Must include route deviation distance');
  assert.ok(summary.includes('safety check-in'), 'Must include missed check-in');
  assert.ok(summary.includes('Sudden deceleration') || summary.includes('abnormal movement'), 'Must include motion anomaly');
  assert.ok(summary.includes('87/100'), 'Must include risk score');
  assert.ok(summary.includes('800 metres away') || summary.includes('police station'), 'Must include nearest assistance');

  console.log(`✔ Test 1.1: Deterministic situation summary generated:\n   "${summary}"`);
}

// Test 1.2: explainMySituation fallback test (unconfigured API key)
{
  const result = await explainMySituation(sampleTelemetry);

  assert.strictEqual(result.source, 'deterministic_engine');
  assert.ok(result.summary.length > 50);
  assert.strictEqual(result.signalsSummary.riskScore, 87);
  assert.strictEqual(result.signalsSummary.trigger, 'MANUAL_SOS');
  assert.strictEqual(result.signalsSummary.routeDeviated, true);
  assert.strictEqual(result.signalsSummary.missedCheckInsCount, 1);
  assert.strictEqual(result.signalsSummary.motionAnomalyDetected, true);

  console.log('✔ Test 1.2: explainMySituation gracefully executes deterministic engine when AI key is not present');
}

// ────────────────────────────────────────────────────────────
// 2. TRUSTED CONTACT EMERGENCY ALERTS
// ────────────────────────────────────────────────────────────
console.log('\n--- 2. Testing Trusted Contact Emergency Alerts ---');

// Test 2.1: Alert message formatting
{
  const message = formatEmergencyAlertMessage({
    userName: 'Jane Doe',
    userPhone: '+91 98765 43210',
    riskLevel: 'CRITICAL',
    riskScore: 92,
    latitude: 28.6139,
    longitude: 77.2090,
    destinationName: 'Cyber City Metro',
    timestamp: '2026-09-08T12:30:00Z',
  });

  assert.ok(message.includes('🚨 Aegis Emergency Alert 🚨'));
  assert.ok(message.includes('Jane Doe (+91 98765 43210)'));
  assert.ok(message.includes('CRITICAL'));
  assert.ok(message.includes('92/100'));
  assert.ok(message.includes('maps.google.com/?q=28.61390,77.20900'));
  assert.ok(message.includes('Cyber City Metro'));

  console.log(`✔ Test 2.1: Emergency alert message formatted correctly:\n${message.split('\n').map(l => '   ' + l).join('\n')}`);
}

// ────────────────────────────────────────────────────────────
// 3. 112 EMERGENCY DIAL PAYLOAD (NO FAKE DISPATCH SYSTEM)
// ────────────────────────────────────────────────────────────
console.log('\n--- 3. Testing 112 Emergency Dial Payload ---');

// Test 3.1: 112 Payload & Spoken Script
{
  const dialData = await getEmergencyDialPayload({
    userName: 'Jane Doe',
    userPhone: '+91 98765 43210',
    latitude: 28.6139,
    longitude: 77.2090,
    destinationName: 'Cyber City Metro',
  });

  assert.strictEqual(dialData.dialNumber, '112');
  assert.strictEqual(dialData.dialUri, 'tel:112');
  assert.strictEqual(dialData.androidIntentAction, 'android.intent.action.DIAL');
  assert.ok(dialData.location.formattedCoordinates.includes('28.61390, 77.20900'));
  assert.ok(dialData.spokenBriefingScript.includes('Jane Doe'));
  assert.ok(dialData.spokenBriefingScript.includes('latitude 28.6139'));
  assert.ok(dialData.spokenBriefingScript.includes('Cyber City Metro'));
  assert.ok(dialData.spokenBriefingScript.includes('Please send emergency assistance immediately.'));

  console.log(`✔ Test 3.1: 112 Dial Payload generated with intent action "${dialData.androidIntentAction}" and tel URI "${dialData.dialUri}"`);
  console.log(`   Spoken 112 Dispatch Script: "${dialData.spokenBriefingScript}"`);
}

// ────────────────────────────────────────────────────────────
// 4. UNIFIED SERVICE INTERFACES AUDIT
// ────────────────────────────────────────────────────────────
console.log('\n--- 4. Final Unified Interface Audit ---');

import * as services from '../src/services/index.ts';

const expectedFunctions = [
  // Auth
  'register',
  'login',
  'logout',
  'getSession',
  'getUser',
  'refreshSession',
  // Journeys
  'createJourney',
  'startJourney',
  'getJourney',
  'getActiveJourney',
  'listJourneys',
  'updateJourney',
  'endJourney',
  // Location
  'saveLocationUpdate',
  'saveLocationUpdateBatch',
  'getJourneyLocations',
  'getLatestLocation',
  // Realtime
  'subscribeToJourneys',
  'subscribeToLocationUpdates',
  'subscribeToEmergencyEvents',
  'subscribeToCheckIns',
  'subscribeToJourneySession',
  // Risk & Deviation
  'calculateRisk',
  'mapScoreToRiskLevel',
  'evaluateJourneyRisk',
  'checkRouteDeviation',
  'calculateDistanceFromRoute',
  // Check-In
  'createCheckIn',
  'respondToCheckIn',
  'markMissedCheckIn',
  // Emergency (Manual & Voice SOS)
  'activateEmergency',
  'triggerManualSOS',
  'triggerVoiceSOS',
  'getActiveEmergency',
  'resolveEmergency',
  // Routing & Route Scoring
  'calculateRoutes',
  'selectSaferRoute',
  'scoreRouteSafety',
  // Nearby Assistance & Safe Destination Ranking
  'searchNearbyAssistance',
  'rankSafeDestinations',
  'getDirectionsToAssistancePlace',
  // Phase 5 Services
  'explainMySituation',
  'generateDeterministicSummary',
  'sendEmergencyAlertToContacts',
  'formatEmergencyAlertMessage',
  'getEmergencyDialPayload',
  'getResponderEmergencyDetails',
  'subscribeToResponderAlerts',
];

for (const fnName of expectedFunctions) {
  assert.strictEqual(
    typeof (services as Record<string, unknown>)[fnName],
    'function',
    `Service function "${fnName}" must be exported from src/services/index.ts`
  );
}

console.log(`✔ Test 4.1: All ${expectedFunctions.length} backend service endpoints are cleanly exported and verified!`);

console.log('\n🎉 ALL PHASE 5 TESTS PASSED SUCCESSFULLY! ✅\n');
