// ============================================================
// tests/phase3.test.ts
// Verification test suite for AEGIS Phase 3:
// Safety Engine, Risk Assessment, Route Deviation, Check-in & Emergency
// ============================================================

import assert from 'node:assert';
import {
  calculateRisk,
  mapScoreToRiskLevel,
} from '../src/services/risk.service.ts';
import {
  checkRouteDeviation,
  calculateHaversineDistance,
} from '../src/services/routeDeviation.service.ts';
import type { RoutePoint } from '../src/services/routeDeviation.service.ts';
import type { RiskSignals } from '../src/services/risk.service.ts';



console.log('🧪 Starting Phase 3 Safety Engine Tests...\n');

// ────────────────────────────────────────────────────────────
// 1. RISK ENGINE TESTS
// ────────────────────────────────────────────────────────────
console.log('--- 1. Testing Risk Engine ---');

// Test 1.1: Empty signals -> 0, LOW
{
  const assessment = calculateRisk({});
  assert.strictEqual(assessment.risk_score, 0);
  assert.strictEqual(assessment.risk_level, 'LOW');
  assert.strictEqual(assessment.is_critical, false);
  console.log('✔ Test 1.1: Empty signals -> score 0 (LOW)');
}

// Test 1.2: Individual signals
{
  // Route deviation (+20)
  const r1 = calculateRisk({ route_deviation: true });
  assert.strictEqual(r1.risk_score, 20);
  assert.strictEqual(r1.risk_level, 'LOW');
  assert.strictEqual(r1.breakdown.route_deviation, 20);

  // Long deviation (+10) with route deviation (+20) = 30 (MODERATE)
  const r2 = calculateRisk({
    route_deviation: true,
    deviation_duration: 350, // >= 300s
  });
  assert.strictEqual(r2.risk_score, 30);
  assert.strictEqual(r2.risk_level, 'MODERATE');
  assert.strictEqual(r2.breakdown.long_deviation, 10);

  // Motion anomaly (+20) + Sudden stop (+15) = 35 (MODERATE)
  const r3 = calculateRisk({
    motion_anomaly: true,
    sudden_stop: true,
  });
  assert.strictEqual(r3.risk_score, 35);
  assert.strictEqual(r3.risk_level, 'MODERATE');

  // Speed change (+10)
  const r4 = calculateRisk({ speed_change: true });
  assert.strictEqual(r4.risk_score, 10);

  // Missed check-in (+10 each)
  const r5 = calculateRisk({ missed_checkins: 2 });
  assert.strictEqual(r5.risk_score, 20);
  assert.strictEqual(r5.breakdown.missed_checkins, 20);

  // Voice SOS (+30)
  const r6 = calculateRisk({ voice_sos: true });
  assert.strictEqual(r6.risk_score, 30);
  assert.strictEqual(r6.risk_level, 'MODERATE');

  console.log('✔ Test 1.2: All individual signals correctly weighted');
}

// Test 1.3: Risk bands (LOW 0-29, MODERATE 30-59, HIGH 60-79, CRITICAL 80-100)
{
  assert.strictEqual(mapScoreToRiskLevel(0), 'LOW');
  assert.strictEqual(mapScoreToRiskLevel(29), 'LOW');
  assert.strictEqual(mapScoreToRiskLevel(30), 'MODERATE');
  assert.strictEqual(mapScoreToRiskLevel(59), 'MODERATE');
  assert.strictEqual(mapScoreToRiskLevel(60), 'HIGH');
  assert.strictEqual(mapScoreToRiskLevel(79), 'HIGH');
  assert.strictEqual(mapScoreToRiskLevel(80), 'CRITICAL');
  assert.strictEqual(mapScoreToRiskLevel(100), 'CRITICAL');
  console.log('✔ Test 1.3: Risk bands correctly mapped (LOW, MODERATE, HIGH, CRITICAL)');
}

// Test 1.4: High risk combination (60–79)
{
  // route_deviation (20) + motion_anomaly (20) + sudden_stop (15) + speed_change (10) = 65 (HIGH)
  const rHigh = calculateRisk({
    route_deviation: true,
    motion_anomaly: true,
    sudden_stop: true,
    speed_change: true,
  });
  assert.strictEqual(rHigh.risk_score, 65);
  assert.strictEqual(rHigh.risk_level, 'HIGH');
  assert.strictEqual(rHigh.is_critical, false);
  console.log('✔ Test 1.4: High risk combinations properly classified');
}

// Test 1.5: Score clamping to 100
{
  // route_deviation (20) + long (10) + motion (20) + sudden (15) + speed (10) + missed (30) + voice (30) = 135 -> clamped to 100
  const rOverflow = calculateRisk({
    route_deviation: true,
    long_deviation: true,
    motion_anomaly: true,
    sudden_stop: true,
    speed_change: true,
    missed_checkins: 3,
    voice_sos: true,
  });
  assert.strictEqual(rOverflow.risk_score, 100);
  assert.strictEqual(rOverflow.risk_level, 'CRITICAL');
  assert.strictEqual(rOverflow.is_critical, true);
  console.log('✔ Test 1.5: Score correctly clamped to 0–100 maximum');
}

// Test 1.6: Manual SOS overrides risk score
{
  // Even with zero other signals, manual_sos sets score to 100 and level to CRITICAL
  const rManual = calculateRisk({ manual_sos: true });
  assert.strictEqual(rManual.risk_score, 100);
  assert.strictEqual(rManual.risk_level, 'CRITICAL');
  assert.strictEqual(rManual.is_critical, true);
  console.log('✔ Test 1.6: Manual SOS overrides risk score immediately to 100 / CRITICAL');
}

// ────────────────────────────────────────────────────────────
// 2. ROUTE DEVIATION TESTS
// ────────────────────────────────────────────────────────────
console.log('\n--- 2. Testing Route Deviation Service ---');

// Test 2.1: Haversine distance accuracy
{
  // Distance between Connaught Place (28.6315, 77.2167) and India Gate (28.6129, 77.2295) in Delhi ~2.4km
  const dist = calculateHaversineDistance(28.6315, 77.2167, 28.6129, 77.2295);
  assert.ok(dist > 2300 && dist < 2600, `Expected ~2400m, got ${dist}`);
  console.log(`✔ Test 2.1: Haversine distance calculation accurate (~${Math.round(dist)}m)`);
}

// Test 2.2: Point directly on route segment
{
  const plannedRoute: RoutePoint[] = [
    { latitude: 28.6000, longitude: 77.2000 },
    { latitude: 28.6100, longitude: 77.2000 }, // Northbound segment along lon 77.20
  ];

  // Midpoint: 28.6050, 77.2000
  const result = checkRouteDeviation({
    currentLatitude: 28.6050,
    currentLongitude: 77.2000,
    plannedRoute,
    thresholdMeters: 100,
  });

  assert.strictEqual(result.deviation_detected, false);
  assert.ok(result.distance_from_route < 5, `Expected <5m, got ${result.distance_from_route}`);
  console.log('✔ Test 2.2: User on planned route is not flagged as deviated');
}

// Test 2.3: Point deviated beyond 100m threshold
{
  const plannedRoute: RoutePoint[] = [
    { latitude: 28.6000, longitude: 77.2000 },
    { latitude: 28.6100, longitude: 77.2000 },
  ];

  // Off route by ~0.005 degrees longitude (~500 meters)
  const result = checkRouteDeviation({
    currentLatitude: 28.6050,
    currentLongitude: 77.2050,
    plannedRoute,
    thresholdMeters: 100,
  });

  assert.strictEqual(result.deviation_detected, true);
  assert.ok(result.distance_from_route > 400, `Expected >400m, got ${result.distance_from_route}`);
  console.log(`✔ Test 2.3: User 500m off route detected as deviation (distance: ${result.distance_from_route}m)`);
}

// Test 2.4: Deviation duration calculation
{
  const plannedRoute: RoutePoint[] = [
    { latitude: 28.6000, longitude: 77.2000 },
    { latitude: 28.6100, longitude: 77.2000 },
  ];

  const now = Date.now();
  const deviationStart = new Date(now - 420 * 1000).toISOString(); // 420 seconds (7 minutes) ago

  const result = checkRouteDeviation({
    currentLatitude: 28.6050,
    currentLongitude: 77.2050,
    plannedRoute,
    thresholdMeters: 100,
    deviationStartedAt: deviationStart,
    currentTimestamp: new Date(now).toISOString(),
  });

  assert.strictEqual(result.deviation_detected, true);
  assert.strictEqual(result.deviation_duration, 420);
  console.log(`✔ Test 2.4: Deviation duration tracked accurately (${result.deviation_duration}s)`);
}

// ────────────────────────────────────────────────────────────
// 3. SERVICE SIGNATURES & EXPORTS
// ────────────────────────────────────────────────────────────
console.log('\n--- 3. Verifying Service Signatures ---');

import * as riskService from '../src/services/risk.service.ts';
import * as routeService from '../src/services/routeDeviation.service.ts';

assert.strictEqual(typeof riskService.calculateRisk, 'function');
assert.strictEqual(typeof riskService.mapScoreToRiskLevel, 'function');
assert.strictEqual(typeof riskService.evaluateJourneyRisk, 'function');
assert.strictEqual(typeof routeService.checkRouteDeviation, 'function');
assert.strictEqual(typeof routeService.calculateDistanceFromRoute, 'function');
assert.strictEqual(typeof routeService.calculateHaversineDistance, 'function');

console.log('✔ Test 3.1: Service functions verified!');

console.log('\n🎉 ALL PHASE 3 TESTS PASSED SUCCESSFULLY! ✅\n');

