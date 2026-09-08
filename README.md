# AEGIS — Mobile Frontend

AEGIS is a journey-based AI women-safety Android mobile application built with React Native and Expo Router.

## Product Concept
Aegis does **not** have a separate "Safety Mode" or "Quick Safety Mode". The journey itself activates safety monitoring:
1. User selects destination
2. Starts Journey
3. Journey Protection becomes active
4. Aegis monitors relevant journey signals
5. User can trigger SOS with emergency dialer access
6. User reaches destination & completes journey

## Architecture
- **Framework:** Expo SDK 57 (Expo Router v4, React Native 0.86, React 19)
- **State Management:** Zustand (`useJourneyStore`, `useAppStore`)
- **Native Android Dialing Layer:** `EmergencyDialer` abstraction using `Intent.ACTION_DIAL` (`tel:112`) — never auto-dials, never requests `CALL_PHONE` permission.
- **Design Tokens:** Semantic obsidian dark theme (`Colors`, `Typography`, `Spacing`, `Theme`).
- **Navigation:**
  - `HOME`: Active Journey card, quick actions, safety signals
  - `JOURNEY`: Plan journey, destination search, journey timeline monitor
  - `EMERGENCY`: Hold-to-confirm SOS button, 112 services, trusted circle
  - `PROFILE`: Safe word, journey monitoring settings, native bridge info

## Verification
- TypeScript type-check: `npx tsc --noEmit`
- Android export test: `npx expo export --platform android`
