/**
 * AEGIS Central State — Unified Store Architecture
 *
 * Centralizes all 9 core state domains to guarantee single-source-of-truth:
 * 1. user (profile, credentials, safe word)
 * 2. destination (name, address, ETA)
 * 3. journey (status, start time, route, duration)
 * 4. location (mock GPS coordinates, accuracy, heading)
 * 5. risk (score 0-100, level LOW/MODERATE/HIGH/CRITICAL, signals)
 * 6. checkIn (status, countdown, response handlers)
 * 7. emergency (emergencyStatus, SOS lifecycle, dialer integration)
 * 8. trustedContacts (circle list, add, edit, delete CRUD)
 * 9. nearbyPlaces (recommended safe place, police, hospital, public places)
 *
 * Eliminates state duplication across components.
 */

import { useAppStore } from './useAppStore';
import { useJourneyStore, selectJourneyDuration } from './useJourneyStore';
import { MOCK_NEARBY_HELP_PLACES, type NearbyHelpPlace } from '../lib/mockData';

export function useAegisStore() {
  // App store slice
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const trustedContacts = useAppStore((s) => s.trustedContacts);
  const addContact = useAppStore((s) => s.addContact);
  const updateContact = useAppStore((s) => s.updateContact);
  const deleteContact = useAppStore((s) => s.deleteContact);
  const emergencyPreferences = useAppStore((s) => s.emergencyPreferences);
  const journeySettings = useAppStore((s) => s.journeySettings);

  // Journey store slice
  const status = useJourneyStore((s) => s.status);
  const destination = useJourneyStore((s) => s.destination);
  const startedAt = useJourneyStore((s) => s.startedAt);
  const selectedRoute = useJourneyStore((s) => s.selectedRoute);
  const safetyScenario = useJourneyStore((s) => s.safetyScenario);
  const riskScore = useJourneyStore((s) => s.riskScore);
  const riskLevel = useJourneyStore((s) => s.riskLevel);
  const signals = useJourneyStore((s) => s.signals);
  const checkInStatus = useJourneyStore((s) => s.checkInStatus);
  const emergencyStatus = useJourneyStore((s) => s.emergencyStatus);
  const sosTriggeredAt = useJourneyStore((s) => s.sosTriggeredAt);
  const sosReason = useJourneyStore((s) => s.sosReason);
  const selectedHelpPlace = useJourneyStore((s) => s.selectedHelpPlace);

  // Actions
  const startJourney = useJourneyStore((s) => s.startJourney);
  const endJourney = useJourneyStore((s) => s.endJourney);
  const setSelectedRoute = useJourneyStore((s) => s.setSelectedRoute);
  const setSafetyScenario = useJourneyStore((s) => s.setSafetyScenario);
  const updateSignal = useJourneyStore((s) => s.updateSignal);
  const promptCheckIn = useJourneyStore((s) => s.promptCheckIn);
  const recordCheckInSafe = useJourneyStore((s) => s.recordCheckInSafe);
  const triggerMissedCheckIn = useJourneyStore((s) => s.triggerMissedCheckIn);
  const confirmSOS = useJourneyStore((s) => s.confirmSOS);
  const cancelSOS = useJourneyStore((s) => s.cancelSOS);
  const resolveEmergency = useJourneyStore((s) => s.resolveEmergency);
  const setSelectedHelpPlace = useJourneyStore((s) => s.setSelectedHelpPlace);
  const resetJourney = useJourneyStore((s) => s.resetJourney);

  const duration = selectJourneyDuration({ startedAt } as any);

  return {
    // 1. User
    user: {
      data: user,
      isAuthenticated,
      safeWord: user?.safeWord ?? 'SHIELD',
    },

    // 2. Destination
    destination,

    // 3. Journey
    journey: {
      status,
      startedAt,
      duration,
      selectedRoute,
      safetyScenario,
      isActive: status === 'active' || status === 'sos',
      startJourney,
      endJourney,
      setSelectedRoute,
      setSafetyScenario,
      resetJourney,
    },

    // 4. Location (Mock GPS telemetry)
    location: {
      currentAddress: 'Connaught Place Outer Ring, New Delhi',
      latitude: 28.6328,
      longitude: 77.2197,
      isLive: status === 'active' || status === 'sos',
    },

    // 5. Risk
    risk: {
      score: riskScore,
      level: riskLevel,
      signals,
      updateSignal,
    },

    // 6. Check-In
    checkIn: {
      status: checkInStatus,
      promptCheckIn,
      recordCheckInSafe,
      triggerMissedCheckIn,
    },

    // 7. Emergency
    emergency: {
      status: emergencyStatus,
      isSOSActive: status === 'sos' || emergencyStatus === 'ACTIVE',
      triggeredAt: sosTriggeredAt,
      reason: sosReason,
      confirmSOS,
      cancelSOS,
      resolveEmergency,
    },

    // 8. Trusted Contacts
    trustedContacts: {
      list: trustedContacts,
      addContact,
      updateContact,
      deleteContact,
    },

    // 9. Nearby Places
    nearbyPlaces: {
      all: MOCK_NEARBY_HELP_PLACES,
      recommended: MOCK_NEARBY_HELP_PLACES.find((p) => p.isRecommended),
      selectedHelpPlace,
      setSelectedHelpPlace,
    },

    // Preferences & Settings
    preferences: {
      emergency: emergencyPreferences,
      journey: journeySettings,
    },
  };
}
