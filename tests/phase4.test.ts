// ============================================================
// tests/phase4.test.ts
// Verification test suite for AEGIS Phase 4:
// Routing, Traffic, Route Safety Scoring, Nearby Assistance & Refuge Ranking
// ============================================================

import assert from 'node:assert';
import {
  calculateRoutes,
  buildFallbackRoutes,
  type CalculateRoutesParams,
} from '../src/services/routing.service.ts';

import {
  selectSaferRoute,
  scoreRouteSafety,
} from '../src/services/routeScoring.service.ts';
import {
  searchNearbyAssistance,
  rankSafeDestinations,
  getDirectionsToAssistancePlace,
} from '../src/services/nearbyPlaces.service.ts';
import type { NearbyAssistancePlace } from '../src/services/nearbyPlaces.service.ts';

console.log('🧪 Starting Phase 4 Routing, Safety Scoring & Nearby Assistance Tests...\n');

// ────────────────────────────────────────────────────────────
// 1. TOMTOM ROUTING & TRAFFIC TESTS
// ────────────────────────────────────────────────────────────
console.log('--- 1. Testing TomTom Routing & Traffic Service ---');

const originDelhi = { latitude: 28.6139, longitude: 77.2090 }; // Connaught Place
const destNoida = { latitude: 28.5355, longitude: 77.3910 };   // Noida Sector 18

// Test 1.1: Route calculation with fallback / offline resilience
{
  const result = await calculateRoutes({
    origin: originDelhi,
    destination: destNoida,
    maxAlternatives: 2,
    travelMode: 'car',
  });

  assert.strictEqual(result.success, true);
  assert.ok(result.routes.length >= 2, `Expected at least 2 routes, got ${result.routes.length}`);

  const primary = result.primaryRoute;
  assert.ok(primary.distanceMeters > 5000, `Expected distance >5000m, got ${primary.distanceMeters}`);
  assert.ok(primary.travelTimeSeconds > 300, `Expected travel time >300s, got ${primary.travelTimeSeconds}`);
  assert.ok(primary.polyline.length > 2, 'Polyline must have points');
  assert.ok(primary.expectedArrival !== undefined, 'Must provide expectedArrival');
  assert.ok(primary.traffic !== undefined, 'Must include traffic info');
  assert.ok(['LOW', 'MODERATE', 'HIGH'].includes(primary.traffic.trafficCongestionLevel));

  console.log(`✔ Test 1.1: Primary route computed (distance: ${primary.distanceKm} km, ETA: ${primary.etaMinutes} mins, traffic: ${primary.traffic.trafficCongestionLevel})`);
}

// Test 1.2: Multiple route options
{
  const result = await calculateRoutes({
    origin: originDelhi,
    destination: destNoida,
    maxAlternatives: 2,
  });

  assert.ok(result.routes.length >= 2, 'Must return alternative routes');
  const alt = result.routes[1];
  assert.strictEqual(alt.isAlternative, true);
  assert.ok(alt.polyline.length > 0, 'Alternative route has geometry');
  assert.ok(alt.traffic.trafficDelaySeconds !== undefined, 'Alternative has traffic delay info');

  console.log(`✔ Test 1.2: Multiple route options returned (${result.routes.length} routes with geometry & traffic)`);
}

// ────────────────────────────────────────────────────────────
// 2. ROUTE SAFETY SCORING TESTS
// ────────────────────────────────────────────────────────────
console.log('\n--- 2. Testing Route Safety Scoring & Selection ---');

// Test 2.1: Route safety evaluation & required wording
{
  const routeCalculation = await calculateRoutes({
    origin: originDelhi,
    destination: destNoida,
    maxAlternatives: 2,
  });

  const safetyResult = selectSaferRoute(routeCalculation.routes, {
    [routeCalculation.routes[0].id]: { nearbyAssistanceCount: 3, mainCorridorPreference: true },
    [routeCalculation.routes[1].id]: { nearbyAssistanceCount: 0, mainCorridorPreference: false },
  });

  // Verify required wording
  assert.strictEqual(safetyResult.recommendation_wording, 'Recommended safer route');
  assert.ok(safetyResult.safety_score >= 0 && safetyResult.safety_score <= 100);
  assert.ok(safetyResult.recommended_route !== undefined);
  assert.ok(safetyResult.advisory_notice.includes('not represent a guarantee of personal safety'));

  console.log(`✔ Test 2.1: Safety route selected with score ${safetyResult.safety_score}/100 and wording "${safetyResult.recommendation_wording}"`);
  console.log(`  Advisory: "${safetyResult.advisory_notice}"`);
}

// Test 2.2: Heavy traffic route receives lower safety score than clear corridor
{
  const testRoutes = buildFallbackRoutes(originDelhi, destNoida, 'car', 1).routes;

  // Simulate route 0 having heavy traffic delay (360 seconds)
  testRoutes[0].traffic.trafficDelaySeconds = 360;
  testRoutes[0].traffic.trafficCongestionLevel = 'HIGH';

  // Simulate route 1 having minimal delay (30 seconds)
  testRoutes[1].traffic.trafficDelaySeconds = 30;
  testRoutes[1].traffic.trafficCongestionLevel = 'LOW';

  const score0 = scoreRouteSafety(testRoutes[0]);
  const score1 = scoreRouteSafety(testRoutes[1]);

  assert.ok(
    score1.safety_score > score0.safety_score,
    `Low traffic score (${score1.safety_score}) must exceed high traffic score (${score0.safety_score})`
  );

  console.log(`✔ Test 2.2: Traffic delay penalty verified (Clear: ${score1.safety_score} vs Congested: ${score0.safety_score})`);
}

// ────────────────────────────────────────────────────────────
// 3. NEARBY ASSISTANCE & SAFE DESTINATION RANKING
// ────────────────────────────────────────────────────────────
console.log('\n--- 3. Testing Nearby Assistance & Safe Destination Ranking ---');

// Test 3.1: Search categories (police, hospital, public places)
{
  const searchResult = await searchNearbyAssistance({
    latitude: 28.6139,
    longitude: 77.2090,
    radiusMeters: 5000,
  });

  assert.strictEqual(searchResult.success, true);
  assert.ok(searchResult.places.length >= 3, 'Must return multiple assistance places');

  const types = new Set(searchResult.places.map((p) => p.type));
  assert.ok(types.has('police'), 'Must include police category');
  assert.ok(types.has('hospital'), 'Must include hospital category');
  assert.ok(types.has('public_place'), 'Must include public places category');

  for (const place of searchResult.places) {
    assert.ok(place.name.length > 0, 'Place must have name');
    assert.ok(typeof place.latitude === 'number');
    assert.ok(typeof place.longitude === 'number');
    assert.ok(typeof place.distanceMeters === 'number');
    assert.ok(['LOW', 'MEDIUM', 'HIGH'].includes(place.estimated_activity));
  }

  console.log(`✔ Test 3.1: Found ${searchResult.places.length} nearby assistance places across all 3 categories (police, hospital, public)`);
}

// Test 3.2: Safe destination ranking with estimated_activity
{
  const mockPlaces: NearbyAssistancePlace[] = [
    {
      id: 'p1',
      name: 'Far Police Outpost',
      type: 'police',
      latitude: 28.64,
      longitude: 77.24,
      address: 'North Rd',
      distanceMeters: 3800,
      distanceKm: 3.8,
      walkingEtaMinutes: 48,
      walkingEtaSeconds: 2900,
      isOpen: true,
      estimated_activity: 'LOW',
    },
    {
      id: 'p2',
      name: 'Nearby Central Police Station',
      type: 'police',
      latitude: 28.615,
      longitude: 77.21,
      address: 'Main Ave',
      distanceMeters: 350,
      distanceKm: 0.35,
      walkingEtaMinutes: 5,
      walkingEtaSeconds: 270,
      isOpen: true,
      estimated_activity: 'MEDIUM',
    },
    {
      id: 'p3',
      name: 'Closed Public Shop',
      type: 'public_place',
      latitude: 28.616,
      longitude: 77.212,
      address: 'Market St',
      distanceMeters: 400,
      distanceKm: 0.4,
      walkingEtaMinutes: 5,
      walkingEtaSeconds: 300,
      isOpen: false, // Closed!
      estimated_activity: 'LOW',
    },
  ];

  const ranking = rankSafeDestinations(mockPlaces);
  assert.strictEqual(ranking.recommended_place.id, 'p2');
  assert.ok(ranking.recommended_place.name.includes('Nearby Central Police Station'));
  assert.ok(['LOW', 'MEDIUM', 'HIGH'].includes(ranking.recommended_place.estimated_activity));
  assert.ok(ranking.ranked_places[2].id === 'p3', 'Closed place must rank lowest');

  console.log(`✔ Test 3.2: Safe destination ranking correctly selected "${ranking.recommended_place.name}" (Activity: ${ranking.recommended_place.estimated_activity})`);
}

// ────────────────────────────────────────────────────────────
// 4. DIRECTIONS TO REFUGE TESTS
// ────────────────────────────────────────────────────────────
console.log('\n--- 4. Testing Directions from Current Location to Refuge ---');

// Test 4.1: Route calculation from current location to selected assistance place
{
  const targetPlace: NearbyAssistancePlace = {
    id: 'test-station',
    name: 'District Police Headquarters',
    type: 'police',
    latitude: 28.6180,
    longitude: 77.2150,
    address: 'HQ Circle',
    distanceMeters: 650,
    distanceKm: 0.65,
    walkingEtaMinutes: 8,
    walkingEtaSeconds: 500,
    isOpen: true,
    estimated_activity: 'MEDIUM',
  };

  const directions = await getDirectionsToAssistancePlace(originDelhi, targetPlace, 'pedestrian');

  assert.strictEqual(directions.destination.id, 'test-station');
  assert.ok(directions.route.success);
  assert.ok(directions.route.primaryRoute.polyline.length > 0);
  assert.ok(directions.directDistanceMeters > 0);

  console.log(`✔ Test 4.1: Directions to refuge generated (direct distance: ${directions.directDistanceMeters}m, route distance: ${directions.route.primaryRoute.distanceMeters}m, ETA: ${directions.route.primaryRoute.etaMinutes} mins)`);
}

console.log('\n🎉 ALL PHASE 4 TESTS PASSED SUCCESSFULLY! ✅\n');
