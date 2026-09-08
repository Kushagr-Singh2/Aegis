# Aegis — Complete Backend Foundation, Safety Engine & Emergency Platform

Personal safety, journey-monitoring, threat intelligence, and emergency response backend built on **Supabase** (PostgreSQL + Auth + Realtime), **TomTom Location Services**, and **Gemini AI**.

---

## Architecture & Technology Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL 15 via Supabase |
| Authentication | Supabase Auth (email/password, sessions, token refresh) |
| Live Synchronization | Supabase Realtime (PostgreSQL replication publication) |
| Location & Traffic | TomTom Routing, Traffic, and Search APIs (Server-Side) |
| Safety & Risk Engine | Multi-Factor Dynamic Risk Scoring + Geodesic Polyline Deviation |
| AI Telemetry Summarizer | Gemini 1.5 Flash + Zero-Dependency Deterministic Rules Engine |
| Emergency Notifications | Multi-Channel Dispatcher (Simulated Dev / Live SMS Providers) |
| Emergency Dispatch Payload | Android `ACTION_DIAL` `tel:112` Intent Protocol |
| Service Layer | TypeScript 5 (`@supabase/supabase-js` v2) |

---

## Directory Layout

```
.
├── supabase/
│   ├── config.toml                          # Supabase CLI local development config
│   └── migrations/
│       ├── 20240001000000_profiles.sql
│       ├── 20240002000000_trusted_contacts.sql
│       ├── 20240003000000_journeys.sql
│       ├── 20240004000000_location_updates.sql
│       ├── 20240005000000_emergency_events.sql
│       ├── 20240006000000_check_ins.sql
│       ├── 20240007000000_phase2_journey_realtime.sql
│       ├── 20240008000000_phase3_safety_engine.sql
│       └── 20240009000000_phase5_alerts_and_responders.sql
├── src/
│   ├── lib/
│   │   └── supabase.ts              # Typed Supabase client singleton (anon key only)
│   ├── types/
│   │   └── database.types.ts        # Hand-crafted and typed DB schema definitions
│   └── services/
│       ├── index.ts                 # Unified barrel export (single import point)
│       ├── auth.service.ts          # register, login, logout, session persistence
│       ├── profile.service.ts       # Profile CRUD & phone binding
│       ├── trustedContact.service.ts# Emergency contact CRUD
│       ├── journey.service.ts       # planned → active → completed/cancelled lifecycle
│       ├── location.service.ts      # Dual-layer validated GPS telemetry ingestion
│       ├── realtime.service.ts      # Multi-table Realtime channel manager
│       ├── risk.service.ts          # 0–100 Weighted multi-modal risk scoring model
│       ├── routeDeviation.service.ts# Cross-track geodesic polyline distance & duration
│       ├── routeScoring.service.ts  # Route candidate scoring ("Recommended safer route")
│       ├── routing.service.ts       # TomTom routing, traffic delay & fallback routes
│       ├── nearbyPlaces.service.ts  # Police, hospital, public refuge search & ranking
│       ├── checkIn.service.ts       # Safety prompts & overdue check-in escalation
│       ├── emergency.service.ts     # Manual SOS, Voice SOS, active emergency lifecycle
│       ├── aiSummary.service.ts     # "Explain My Situation" (AI & deterministic fallback)
│       ├── alert.service.ts         # Trusted contact alert dispatch & audit logging
│       └── responder.service.ts     # 112 Dial payload & responder emergency dossier
├── tests/
│   ├── loader.mjs                   # Node ESM resolution hook for tests
│   ├── mockSupabase.mjs             # In-memory Supabase client mock for offline tests
│   ├── phase3.test.ts               # Safety Engine & Risk test suite
│   ├── phase4.test.ts               # Routing, Traffic & Refuge test suite
│   └── phase5.test.ts               # AI, Alerts, Voice SOS & Responder test suite
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Configuration & Security Principles

```bash
cp .env.example .env
```

| Environment Variable | Role | Client / Server |
|---|---|---|
| `SUPABASE_URL` | Supabase API endpoint | Client safe |
| `SUPABASE_ANON_KEY` | Public Anon key with RLS enforcement | Client safe |
| `TOMTOM_API_KEY` | Routing & Search key | **Server-side only** |
| `GEMINI_API_KEY` | Emergency situation summarizer key | **Server-side only** |

### 🔒 Core Security Rules:
1. **Never expose service-role credentials**: All database transactions use `SUPABASE_ANON_KEY` governed strictly by PostgreSQL Row Level Security (RLS).
2. **Strict RLS on all 7 tables**:
   - `profiles`: `id = auth.uid()`
   - `trusted_contacts`: `user_id = auth.uid()`
   - `journeys`: `user_id = auth.uid()`
   - `location_updates`: `journey.user_id = auth.uid()`
   - `check_ins`: `journey.user_id = auth.uid()`
   - `emergency_events`: `user_id = auth.uid()` + designated trusted contacts during active emergency
   - `emergency_notifications`: `user_id = auth.uid()`
3. **Dual-Layer Telemetry Security**: `saveLocationUpdate()` validates journey ownership in application code before inserting, backed by database RLS.
4. **Third-Party API Secrets**: TomTom and Gemini keys are accessed exclusively in server-side functions and never bundled or returned to client responses.

---

## Phase 5 Feature Specifications

### 1. AI Situation Summary ("Explain My Situation") (`aiSummary.service.ts`)
- **Inputs**: Journey destination, current GPS coordinates, risk score, risk level, route deviation (meters/duration), missed check-ins, motion telemetry, emergency trigger type, nearest assistance facility.
- **Rule**: The AI strictly synthesizes factual signals; **it does NOT decide whether an emergency exists**.
- **Deterministic Fallback**: Automatically activates if `GEMINI_API_KEY` is omitted or API is unreachable, generating a standardized factual briefing.

### 2. Voice SOS (`emergency.service.ts`)
- `triggerVoiceSOS({ journeyId, latitude, longitude, detectedPhrase })`:
  - Receives `VOICE_SOS` event from on-device Android keyword spotter.
  - Automatically activates an `emergency_event` with `trigger_type: 'VOICE_SOS'`, sets risk score to `90` (`CRITICAL`), and transitions parent journey to `'emergency'`.

### 3. Trusted Contact Emergency Alerts (`alert.service.ts`)
- `sendEmergencyAlertToContacts({ emergency, destinationName })`:
  - Dispatches standardized high-urgency alerts with user details, risk level, risk score, Google Maps coordinates, and journey destination.
  - **Integrity Guarantee**: When SMS providers (e.g. Twilio) are unconfigured, logs to `emergency_notifications` with `status: 'simulated_dev'` and `external_sent: false`. Does not pretend an external message was sent.

### 4. 112 Emergency Dial Data (`responder.service.ts`)
- `getEmergencyDialPayload({ userName, userPhone, latitude, longitude, destinationName })`:
  - Prepares the Android intent payload:
    - Action: `android.intent.action.DIAL`
    - URI: `tel:112`
  - Generates a spoken dispatch script for the caller to speak directly to the 112 operator.
  - **No fake police dispatch system is created**.

### 5. Responder Emergency Dossier & Realtime (`responder.service.ts`)
- `getResponderEmergencyDetails(emergencyId)`:
  - Compiles full responder dossier: user profile, journey parameters, route geometry, latest GPS coordinates, nearest assistance stations, and AI situation summary.
- `subscribeToResponderAlerts(onAlert)`:
  - Live Supabase Realtime subscription stream for emergency dispatchers.

---

## Complete Usage Example

```typescript
import {
  // Auth
  register, login,
  // Journeys
  createJourney, startJourney,
  // Location
  saveLocationUpdate,
  // Risk & Deviation
  checkRouteDeviation, calculateRisk,
  // TomTom Routing
  calculateRoutes, selectSaferRoute,
  // Nearby Refuge
  searchNearbyAssistance, rankSafeDestinations, getDirectionsToAssistancePlace,
  // Emergency
  triggerManualSOS, triggerVoiceSOS,
  // Phase 5 AI & Alerts
  explainMySituation, sendEmergencyAlertToContacts, getEmergencyDialPayload,
  // Responder Access
  getResponderEmergencyDetails, subscribeToResponderAlerts,
} from './src/services';

// ── 1. Create & Start Journey ────────────────────────────────
const { data: journey } = await createJourney({
  destination_name: 'Cyber City Hub',
  destination_lat: 28.4950,
  destination_lng: 77.0890,
  expected_arrival: new Date(Date.now() + 35 * 60_000).toISOString(),
});
await startJourney(journey!.id);

// ── 2. Real-Time Telemetry & Safety Check ────────────────────
const currentLoc = { latitude: 28.5100, longitude: 77.1050 };
await saveLocationUpdate({
  journey_id: journey!.id,
  ...currentLoc,
  speed: 12.4,
});

// Check route deviation
const deviation = checkRouteDeviation({
  currentLatitude: currentLoc.latitude,
  currentLongitude: currentLoc.longitude,
  plannedRoute: [{ latitude: 28.5200, longitude: 77.1200 }],
  thresholdMeters: 100,
});

// Calculate multi-modal risk
const risk = calculateRisk({
  route_deviation: deviation.deviation_detected,
  deviation_duration: deviation.deviation_duration,
  sudden_stop: true,
});

// ── 3. Emergency Activation (Manual or Voice SOS) ────────────
const { data: emergency } = await triggerManualSOS({
  journeyId: journey!.id,
  ...currentLoc,
});

// ── 4. Dispatch Alerts to Trusted Contacts ───────────────────
await sendEmergencyAlertToContacts({
  emergency: emergency!,
  destinationName: journey!.destination_name,
});

// ── 5. AI "Explain My Situation" ─────────────────────────────
const situation = await explainMySituation({
  journey: { destination_name: journey!.destination_name, status: 'emergency' },
  currentLocation: currentLoc,
  riskScore: emergency!.risk_score!,
  riskLevel: 'CRITICAL',
  emergencyTrigger: emergency!.trigger_type,
  routeDeviation: deviation,
  motionAnomalies: { sudden_stop: true },
});
console.log('Briefing:', situation.summary);

// ── 6. 112 Emergency Dial ────────────────────────────────────
const dialData = await getEmergencyDialPayload({
  userName: 'Jane Doe',
  ...currentLoc,
  destinationName: journey!.destination_name,
});
// Android client launches Intent(dialData.androidIntentAction, Uri.parse(dialData.dialUri))

// ── 7. Responder Access ──────────────────────────────────────
const dossier = await getResponderEmergencyDetails(emergency!.id);
console.log('Responder Dossier:', dossier.data);
```

---

## Verification Test Suites

Run the full end-to-end regression test suite:

```bash
# Run all Phase 3, 4, and 5 tests sequentially
SUPABASE_URL="https://dummy.supabase.co" SUPABASE_ANON_KEY="dummy-anon-key" \
node --experimental-strip-types --loader ./tests/loader.mjs tests/phase3.test.ts && \
node --experimental-strip-types --loader ./tests/loader.mjs tests/phase4.test.ts && \
node --experimental-strip-types --loader ./tests/loader.mjs tests/phase5.test.ts
```

All 3 suites pass with 100% assertions satisfied.