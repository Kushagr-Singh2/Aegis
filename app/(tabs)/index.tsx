/**
 * AEGIS Home Screen (Phase 2)
 *
 * Core requirement:
 * Immediately communicates: "Tell us where you're going."
 *
 * Phase 2 changes:
 * - "WHERE ARE YOU GOING?" card navigates to /destination-search (full-screen)
 * - Tapping a recent shortcut goes straight to /route-preview
 * - START JOURNEY navigates to search or route-preview depending on selection
 * - Active journey banner links to /active-journey
 * - Inline search bottom-sheet removed (replaced by dedicated screen)
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { AegisHeader } from '../../src/components/ui/AegisHeader';
import { LocationCard } from '../../src/components/home/LocationCard';
import { DestinationSearchCard } from '../../src/components/home/DestinationSearchCard';
import { RecentDestinationCard } from '../../src/components/home/RecentDestinationCard';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { EmergencyButton } from '../../src/components/ui/EmergencyButton';
import {
  Heading3,
  BodySmall,
  Label,
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Colors } from '../../src/constants/colors';
import { BorderRadius, Spacing } from '../../src/constants/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { useJourneyStore, type JourneyDestination } from '../../src/store/useJourneyStore';
import { useJourneyStatus } from '../../src/hooks/useJourneyStatus';
import { SOSConfirmationModal } from '../../src/components/emergency/SOSConfirmationModal';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);

  const journeyStatus = useJourneyStore((s) => s.status);
  const activeDestination = useJourneyStore((s) => s.destination);
  const journeyInfo = useJourneyStatus();

  // Destination selected via recent shortcut (triggers route preview directly)
  const [selectedDestination, setSelectedDestination] =
    useState<JourneyDestination | null>(null);

  const [isSOSModalVisible, setIsSOSModalVisible] = useState(false);

  const isJourneyActive = journeyStatus === 'active' || journeyStatus === 'sos';

  // Tapping a recent destination goes straight to route preview
  const handleSelectDestination = (dest: JourneyDestination) => {
    setSelectedDestination(dest);
    router.push({
      pathname: '/route-preview',
      params: {
        destName: dest.name,
        destAddress: dest.address,
        destEta: dest.estimatedTime,
      },
    });
  };

  // "WHERE ARE YOU GOING?" card opens full-screen search
  const handleGoToSearch = () => {
    router.push('/destination-search');
  };

  // START JOURNEY — goes to search if no destination, else route preview
  const handleStartJourney = () => {
    if (selectedDestination) {
      router.push({
        pathname: '/route-preview',
        params: {
          destName: selectedDestination.name,
          destAddress: selectedDestination.address,
          destEta: selectedDestination.estimatedTime,
        },
      });
    } else {
      router.push('/destination-search');
    }
  };

  const handleTriggerSOSModal = () => setIsSOSModalVisible(true);

  return (
    <SafeScreen style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Header */}
        <AegisHeader
          userName={user ? user.name.split(' ')[0] : 'Protected'}
          onPressSOS={handleTriggerSOSModal}
        />

        {/* 2. Active Journey Alert (if already active) */}
        {isJourneyActive && activeDestination && (
          <Card variant="safe" padding="md" style={styles.activeBanner}>
            <View style={styles.activeRow}>
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color={Colors.safe.default}
              />
              <View style={styles.activeTextContainer}>
                <Heading3 style={styles.activeTitle}>Active Journey</Heading3>
                <BodySmall color={Colors.text.secondary}>
                  Heading to {activeDestination.name} • {journeyInfo.duration}
                </BodySmall>
              </View>
              <TouchableOpacity
                style={styles.viewJourneyBtn}
                onPress={() => router.push('/active-journey')}
              >
                <BodySmall color={Colors.brand.primary}>View</BodySmall>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* 3. Current Location Card */}
        <LocationCard />

        {/* 4. Large Destination Card: WHERE ARE YOU GOING? */}
        <DestinationSearchCard
          selectedDestination={selectedDestination}
          onPressSearch={handleGoToSearch}
          onClearDestination={() => setSelectedDestination(null)}
        />

        {/* 5. Recent Destinations: Home, College, Work */}
        <RecentDestinationCard
          selectedDestinationName={selectedDestination?.name}
          onSelectDestination={handleSelectDestination}
        />

        {/* 6. Primary CTA: [ START JOURNEY ] */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            label="START JOURNEY"
            icon="navigation-variant"
            onPress={handleStartJourney}
          />
          {!selectedDestination && (
            <BodySmall align="center" color={Colors.text.tertiary} style={styles.ctaHint}>
              Tap a recent destination above or search to activate journey protection
            </BodySmall>
          )}
        </View>

        {/* 7. Persistent Emergency Assistance Section */}
        <View style={styles.emergencySection}>
          <Label style={styles.emergencySectionLabel}>IMMEDIATE ASSISTANCE</Label>
          <EmergencyButton onPress={handleTriggerSOSModal} />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Persistent Floating SOS Button */}
      <EmergencyButton size="floating" onPress={handleTriggerSOSModal} />

      {/* Universal 2-Step SOS Confirmation Modal */}
      <SOSConfirmationModal
        visible={isSOSModalVisible}
        onClose={() => setIsSOSModalVisible(false)}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'] + 20,
    gap: Spacing.lg,
  },
  activeBanner: {
    marginHorizontal: Spacing.md,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  activeTextContainer: {
    flex: 1,
  },
  activeTitle: {
    fontSize: 16,
  },
  viewJourneyBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  ctaContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  ctaHint: {
    marginTop: 4,
  },
  emergencySection: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  emergencySectionLabel: {
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  bottomSpacer: {
    height: 32,
  },
});
