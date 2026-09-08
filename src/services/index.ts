// ============================================================
// src/services/index.ts
// Unified Barrel Export for ALL AEGIS Backend Services.
// Import everything from this single clean entry point.
//
// Categories:
//   - Auth & Profiles
//   - Journeys & Real-time Location Tracking
//   - Risk Assessment & Geodesic Route Deviation
//   - Check-Ins & Safety Prompts
//   - Emergency & Instant SOS (Manual & Voice)
//   - TomTom Routing, Traffic & Safety Route Scoring
//   - Nearby Assistance & Refuge Ranking
//   - AI Situation Summary ("Explain My Situation")
//   - Trusted Contact Alerts & 112 Dispatch Information
//   - Responder Dossier & Realtime Feeds
// ============================================================

export * from './aiSummary.service';
export * from './alert.service';
export * from './auth.service';
export * from './checkIn.service';
export * from './emergency.service';
export * from './journey.service';
export * from './location.service';
export * from './nearbyPlaces.service';
export * from './profile.service';
export * from './realtime.service';
export * from './responder.service';
export * from './risk.service';
export * from './routeDeviation.service';
export * from './routeScoring.service';
export * from './routing.service';
export * from './trustedContact.service';
