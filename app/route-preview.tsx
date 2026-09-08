/**
 * Route Preview Screen (Phase 2)
 *
 * Full-screen route selection:
 * - Mock map with current location, destination pin, and 3 route lines
 * - Horizontal route card list (Route A / B / C)
 * - Distance + ETA summary bar
 * - Safety recommendation note
 * - [ START JOURNEY ] button
 *
 * No real map SDK — uses MockMapView (styled View placeholder).
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MockMapView } from '../src/components/map/MockMapView';
import { RouteList } from '../src/components/map/RouteList';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { Heading2, Heading3, Body, BodySmall, Label } from '../src/components/ui/Typography';
import { Card } from '../src/components/ui/Card';
import { Colors } from '../src/constants/colors';
import { BorderRadius, Spacing } from '../src/constants/spacing';
import { MOCK_ROUTES } from '../src/lib/mockData';
import { useJourneyStore } from '../src/store/useJourneyStore';

export default function RoutePreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    destName: string;
    destAddress: string;
    destEta: string;
  }>();

  const setSelectedRoute = useJourneyStore((s) => s.setSelectedRoute);
  const startJourney = useJourneyStore((s) => s.startJourney);

  // Default to the recommended route (Route B)
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_b');

  const selectedRoute = MOCK_ROUTES.find((r) => r.id === selectedRouteId) ?? MOCK_ROUTES[1];

  const destName = params.destName ?? 'Destination';
  const destAddress = params.destAddress ?? '';

  const handleSelectRoute = (route: (typeof MOCK_ROUTES)[0]) => {
    setSelectedRouteId(route.id);
  };

  const handleStartJourney = () => {
    setSelectedRoute(selectedRoute);
    startJourney({
      name: destName,
      address: destAddress,
      estimatedTime: selectedRoute.eta,
    });
    router.push('/active-journey');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Map area ─────────────────────────────────────────────────── */}
      <View style={styles.mapContainer}>
        <MockMapView
          routes={MOCK_ROUTES}
          selectedRouteId={selectedRouteId}
          destinationName={destName}
          style={styles.map}
        />

        {/* Back button over map */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text.primary} />
        </TouchableOpacity>

        {/* Map overlay: destination name */}
        <View style={styles.destOverlay}>
          <MaterialCommunityIcons name="map-marker" size={16} color={Colors.danger.default} />
          <BodySmall style={styles.destOverlayText} numberOfLines={1}>
            {destName}
          </BodySmall>
        </View>
      </View>

      {/* ── Bottom panel ─────────────────────────────────────────────── */}
      <ScrollView
        style={styles.panel}
        contentContainerStyle={[styles.panelContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Destination summary */}
        <View style={styles.destSummary}>
          <View style={styles.destInfo}>
            <Heading2 numberOfLines={1}>{destName}</Heading2>
            {destAddress ? (
              <BodySmall color={Colors.text.secondary} numberOfLines={1}>
                {destAddress}
              </BodySmall>
            ) : null}
          </View>
          <View style={styles.selectedEta}>
            <Heading3 style={styles.etaValue}>{selectedRoute.eta}</Heading3>
            <BodySmall color={Colors.text.secondary}>{selectedRoute.distance}</BodySmall>
          </View>
        </View>

        {/* Safety note */}
        <Card variant="safe" padding="sm" style={styles.safetyNote}>
          <View style={styles.safetyNoteRow}>
            <MaterialCommunityIcons name="shield-check" size={16} color={Colors.safe.default} />
            <BodySmall color={Colors.safe.default} style={styles.safetyNoteText}>
              Route B is the recommended safer route — lower traffic, better-lit roads.
            </BodySmall>
          </View>
        </Card>

        {/* Route cards */}
        <View>
          <Label style={styles.sectionLabel}>SELECT ROUTE</Label>
          <RouteList
            routes={MOCK_ROUTES}
            selectedRouteId={selectedRouteId}
            onSelectRoute={handleSelectRoute}
          />
        </View>

        {/* Traffic & safety details for selected route */}
        <View style={styles.detailGrid}>
          <DetailChip
            icon="clock-outline"
            label="ETA"
            value={selectedRoute.eta}
            color={Colors.text.primary}
          />
          <DetailChip
            icon="map-marker-distance"
            label="Distance"
            value={selectedRoute.distance}
            color={Colors.text.primary}
          />
          <DetailChip
            icon="car-speed-limiter"
            label="Traffic"
            value={selectedRoute.traffic}
            color={
              selectedRoute.traffic === 'Heavy'
                ? Colors.danger.default
                : selectedRoute.traffic === 'Low'
                ? Colors.safe.default
                : Colors.warning.default
            }
          />
          <DetailChip
            icon="shield-half-full"
            label="Safety"
            value={selectedRoute.safetyRating}
            color={
              selectedRoute.safetyRating === 'Best'
                ? Colors.safe.default
                : selectedRoute.safetyRating === 'Good'
                ? Colors.brand.primary
                : Colors.warning.default
            }
          />
        </View>

        {/* Start Journey CTA */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            label="START JOURNEY"
            icon="navigation-variant"
            onPress={handleStartJourney}
          />
          <BodySmall align="center" color={Colors.text.tertiary} style={styles.ctaDisclaimer}>
            AEGIS provides route guidance and safety monitoring.
            It does not guarantee safety outcomes.
          </BodySmall>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailChip({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={chipStyles.chip}>
      <MaterialCommunityIcons name={icon as any} size={16} color={Colors.text.secondary} />
      <Label style={chipStyles.label}>{label}</Label>
      <Body style={[chipStyles.value, { color }]}>{value}</Body>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.default,
  },
  label: {
    fontSize: 10,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
  },
  value: {
    fontWeight: '700',
    fontSize: 14,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  mapContainer: {
    position: 'relative',
  },
  map: {
    borderRadius: 0,
    height: 280,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  destOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background.overlay,
    borderRadius: BorderRadius.badge,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  destOverlayText: {
    color: Colors.text.primary,
    maxWidth: 200,
  },
  panel: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  panelContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  destSummary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  destInfo: {
    flex: 1,
    gap: 4,
  },
  selectedEta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  etaValue: {
    fontWeight: '800',
    color: Colors.brand.primaryLight,
  },
  safetyNote: {},
  safetyNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  safetyNoteText: {
    flex: 1,
    lineHeight: 18,
  },
  sectionLabel: {
    color: Colors.text.tertiary,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  ctaContainer: {
    gap: Spacing.xs,
  },
  ctaDisclaimer: {
    lineHeight: 17,
    paddingHorizontal: Spacing.md,
  },
});
