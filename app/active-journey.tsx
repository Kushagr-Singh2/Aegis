/**
 * Active Journey Screen (Phase 3)
 *
 * Full-screen journey monitoring:
 * - "JOURNEY ACTIVE" header
 * - Mock map with current location, destination, planned route
 * - Safety Check-in Card (ARE YOU SAFE? with countdown timer, I'M SAFE / SOS)
 * - Safety Risk Card (Score e.g. 32/100, Level, Live Signals, Mock signal changes)
 * - Always-visible bottom sheet with metrics & actions
 * - Persistent floating SOS button opening universal 2-step confirmation
 * - DEV-ONLY demo controls
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MockMapView } from '../src/components/map/MockMapView';
import { ActiveJourneySheet } from '../src/components/journey/ActiveJourneySheet';
import { SafetyCheckInCard } from '../src/components/journey/SafetyCheckInCard';
import { SafetyRiskCard } from '../src/components/risk/SafetyRiskCard';
import { DemoControls } from '../src/components/journey/DemoControls';
import { SOSConfirmationModal } from '../src/components/emergency/SOSConfirmationModal';
import { Label, Heading2, BodySmall } from '../src/components/ui/Typography';
import { Colors } from '../src/constants/colors';
import { BorderRadius, Shadow, Spacing } from '../src/constants/spacing';
import {
  MOCK_ROUTES,
  MOCK_SAFETY_SCENARIOS,
  type SafetyScenario,
  type NearbyHelpPlace,
} from '../src/lib/mockData';
import { DirectionsModal } from '../src/components/emergency/DirectionsModal';
import { useJourneyStore } from '../src/store/useJourneyStore';

export default function ActiveJourneyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const destination = useJourneyStore((s) => s.destination);
  const selectedRoute = useJourneyStore((s) => s.selectedRoute);
  const safetyScenario = useJourneyStore((s) => s.safetyScenario);
  const setSafetyScenario = useJourneyStore((s) => s.setSafetyScenario);

  const [showDevControls, setShowDevControls] = useState(false);
  const [isSOSModalVisible, setIsSOSModalVisible] = useState(false);
  const [isDirectionsVisible, setIsDirectionsVisible] = useState(false);

  const currentScenarioConfig =
    MOCK_SAFETY_SCENARIOS.find((s) => s.key === safetyScenario) ?? MOCK_SAFETY_SCENARIOS[0];

  const activeRoute = selectedRoute ?? MOCK_ROUTES[1]; // default Route B

  const destinationPlace: NearbyHelpPlace = {
    id: destination?.id ?? 'active_dest',
    name: destination?.name ?? 'Destination',
    category: 'public_space',
    categoryLabel: 'Planned Route',
    distance: activeRoute.distance,
    walkingEta: activeRoute.eta,
    direction: '↗ NE',
    isOpen: true,
    estimatedActivity: 'MEDIUM',
    address: destination?.address ?? 'En route to destination',
    isRecommendedSafe: true,
  };

  const handleEndJourney = () => {
    router.replace('/journey-complete');
  };

  const handleTriggerSOS = () => {
    setIsSOSModalVisible(true);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Label style={styles.headerLabel}>JOURNEY ACTIVE</Label>
          <Heading2 numberOfLines={1} style={styles.headerTitle}>
            {destination?.name ?? 'Destination'}
          </Heading2>
        </View>
        <TouchableOpacity
          style={styles.devToggle}
          onPress={() => setShowDevControls((v) => !v)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name="code-tags"
            size={18}
            color={showDevControls ? Colors.warning.default : Colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>

      {/* ── Map ────────────────────────────────────────────────────────── */}
      <View style={styles.mapContainer}>
        <MockMapView
          routes={MOCK_ROUTES}
          selectedRouteId={activeRoute.id}
          destinationName={destination?.name}
          style={styles.map}
        />

        {/* Live indicator overlay */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <BodySmall style={styles.liveText}>LIVE</BodySmall>
        </View>
      </View>

      {/* ── Scrollable middle area (Check-in & Risk Score) ─────────────── */}
      <ScrollView
        style={styles.middleArea}
        contentContainerStyle={styles.middleContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase 3: Safety Check-in Card (ARE YOU SAFE?) */}
        <SafetyCheckInCard onTriggerSOS={handleTriggerSOS} />

        {/* Phase 3: Safety Risk Card (Score, Tier, Signals, Mock changes) */}
        <SafetyRiskCard />

        {/* Optional Dev Scenario Controls */}
        {showDevControls && (
          <DemoControls
            currentScenario={safetyScenario as SafetyScenario}
            onSelectScenario={(s) => setSafetyScenario(s)}
          />
        )}
      </ScrollView>

      {/* ── Bottom Sheet ────────────────────────────────────────────────── */}
      <ActiveJourneySheet
        scenario={currentScenarioConfig}
        route={activeRoute}
        onViewRoute={() => setIsDirectionsVisible(true)}
        onEndJourney={handleEndJourney}
      />

      {/* ── Floating SOS button (Opens universal 2-step confirmation) ──── */}
      <TouchableOpacity
        style={[styles.sosButton, { bottom: insets.bottom + 160 }]}
        onPress={handleTriggerSOS}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="alert-octagon" size={22} color={Colors.white} />
        <Label style={styles.sosLabel}>SOS</Label>
      </TouchableOpacity>

      {/* Walking Route Directions Modal */}
      <DirectionsModal
        visible={isDirectionsVisible}
        place={destinationPlace}
        onClose={() => setIsDirectionsVisible(false)}
      />

      {/* Universal 2-Step SOS Modal */}
      <SOSConfirmationModal
        visible={isSOSModalVisible}
        onClose={() => setIsSOSModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerLabel: {
    color: Colors.safe.default,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    maxWidth: 260,
  },
  devToggle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface.secondary,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  mapContainer: {
    position: 'relative',
  },
  map: {
    borderRadius: 0,
    height: 200,
  },
  liveIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background.overlay,
    borderRadius: BorderRadius.badge,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.danger.default,
  },
  liveText: {
    color: Colors.white,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
  },
  middleArea: {
    flex: 1,
  },
  middleContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  // Floating SOS
  sosButton: {
    position: 'absolute',
    right: Spacing.md,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.danger.default,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...Shadow.danger,
    zIndex: 99,
  },
  sosLabel: {
    color: Colors.white,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '800',
  },
});
