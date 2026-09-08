/**
 * AEGIS Home Screen (Phase 1)
 *
 * Core requirement:
 * Immediately communicates: "Tell us where you're going."
 *
 * Sections:
 * 1. AegisHeader: "AEGIS", "Good evening, [User]", "Your journey, your safety."
 * 2. LocationCard: 📍 Current Location, "Getting your location..." (mock GPS)
 * 3. DestinationSearchCard: WHERE ARE YOU GOING?, [ 🔍 Search destination ]
 * 4. RecentDestinationCard: Home, College, Work (tappable shortcuts)
 * 5. Primary CTA: [ START JOURNEY ] (disabled until destination selected)
 * 6. Persistent SOS Button: Opens Emergency Modal (never calls automatically)
 * 7. Search BottomSheet: Mock destination autocomplete
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
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
import { Modal } from '../../src/components/ui/Modal';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { Button } from '../../src/components/ui/Button';
import {
  Heading2,
  Heading3,
  Body,
  BodySecondary,
  BodySmall,
  Label,
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Colors } from '../../src/constants/colors';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { useJourneyStore, type JourneyDestination } from '../../src/store/useJourneyStore';
import { useJourneyStatus } from '../../src/hooks/useJourneyStatus';
import { MOCK_DESTINATIONS } from '../../src/lib/mockData';
import { EmergencyDialer } from '../../src/lib/EmergencyDialer';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);

  const journeyStatus = useJourneyStore((s) => s.status);
  const activeDestination = useJourneyStore((s) => s.destination);
  const startJourney = useJourneyStore((s) => s.startJourney);
  const endJourney = useJourneyStore((s) => s.endJourney);
  const journeyInfo = useJourneyStatus();

  // Selected destination state for journey initiation
  const [selectedDestination, setSelectedDestination] =
    useState<JourneyDestination | null>(null);

  // Modals
  const [isSearchSheetVisible, setIsSearchSheetVisible] = useState(false);
  const [isSOSModalVisible, setIsSOSModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isJourneyActive = journeyStatus === 'active' || journeyStatus === 'sos';

  // Filter mock destinations for the search bottom sheet
  const filteredDestinations = searchQuery.trim().length > 0
    ? MOCK_DESTINATIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : MOCK_DESTINATIONS;

  const handleSelectDestination = (dest: JourneyDestination) => {
    setSelectedDestination(dest);
    setIsSearchSheetVisible(false);
  };

  const handleStartJourney = () => {
    if (!selectedDestination) return;
    startJourney(selectedDestination);
    // Option to transition to Journey tab
    router.push('/(tabs)/journey');
  };

  const handleTriggerSOSModal = () => {
    setIsSOSModalVisible(true);
  };

  const handleMockDialer112 = () => {
    EmergencyDialer.callEmergency();
  };

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
                onPress={() => router.push('/(tabs)/journey')}
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
          onPressSearch={() => setIsSearchSheetVisible(true)}
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
            disabled={!selectedDestination}
            disabledLabel="Select a destination"
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

      {/* Persistent Floating SOS Button for quick one-handed access */}
      <EmergencyButton size="floating" onPress={handleTriggerSOSModal} />

      {/* ── Search Bottom Sheet ────────────────────────────────────────── */}
      <BottomSheet
        visible={isSearchSheetVisible}
        onClose={() => setIsSearchSheetVisible(false)}
        title="Where are you going?"
        subtitle="Select or search a destination to begin protection"
      >
        <View style={styles.sheetContent}>
          {/* Search Input */}
          <View style={styles.sheetSearchBox}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={Colors.text.tertiary}
            />
            <TextInput
              style={styles.sheetInput}
              placeholder="Search destination..."
              placeholderTextColor={Colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color={Colors.text.tertiary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Results List */}
          <FlatList
            data={filteredDestinations}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={styles.resultsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() =>
                  handleSelectDestination({
                    name: item.name,
                    address: item.address,
                    estimatedTime: item.estimatedTime,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.resultIconCircle}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={20}
                    color={Colors.brand.primary}
                  />
                </View>
                <View style={styles.resultText}>
                  <Body numberOfLines={1}>{item.name}</Body>
                  <BodySmall color={Colors.text.secondary} numberOfLines={1}>
                    {item.address}
                  </BodySmall>
                </View>
                <View style={styles.resultMeta}>
                  <BodySmall color={Colors.safe.default}>
                    {item.estimatedTime}
                  </BodySmall>
                  <BodySmall color={Colors.text.tertiary}>
                    {item.distance}
                  </BodySmall>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyResults}>
                <MaterialCommunityIcons
                  name="map-marker-off"
                  size={32}
                  color={Colors.text.tertiary}
                />
                <BodySecondary align="center">
                  No destinations found for "{searchQuery}"
                </BodySecondary>
              </View>
            }
          />
        </View>
      </BottomSheet>

      {/* ── SOS Confirmation / Emergency Modal ──────────────────────────── */}
      <Modal
        visible={isSOSModalVisible}
        onClose={() => setIsSOSModalVisible(false)}
        title="Emergency Assistance"
        subtitle="Aegis Emergency Support"
      >
        <View style={styles.sosModalContent}>
          <View style={styles.sosAlertBox}>
            <MaterialCommunityIcons
              name="alert-octagon"
              size={36}
              color={Colors.danger.default}
            />
            <View style={styles.sosAlertText}>
              <Heading3 style={{ color: Colors.danger.default }}>
                Emergency Mode (Phase 1)
              </Heading3>
              <BodySmall color={Colors.text.secondary}>
                Zero automatic calls are ever placed. Tapping below opens your Android dialer with 112 pre-filled.
              </BodySmall>
            </View>
          </View>

          <View style={styles.sosActions}>
            <Button
              label="Open 112 Dialer (Mock)"
              variant="danger"
              size="lg"
              onPress={() => {
                setIsSOSModalVisible(false);
                handleMockDialer112();
              }}
              leftIcon={
                <MaterialCommunityIcons
                  name="phone-outgoing"
                  size={20}
                  color={Colors.white}
                />
              }
            />

            <Button
              label="Cancel"
              variant="secondary"
              size="md"
              onPress={() => setIsSOSModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
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
  // Search sheet
  sheetContent: {
    gap: Spacing.md,
    maxHeight: 480,
  },
  sheetSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
    gap: Spacing.sm,
  },
  sheetInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 15,
    paddingVertical: 2,
  },
  resultsList: {
    maxHeight: 320,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
    gap: Spacing.sm,
  },
  resultIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    flex: 1,
  },
  resultMeta: {
    alignItems: 'flex-end',
  },
  emptyResults: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  // SOS Modal
  sosModalContent: {
    gap: Spacing.lg,
  },
  sosAlertBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.danger.tint,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger.default,
    alignItems: 'center',
  },
  sosAlertText: {
    flex: 1,
  },
  sosActions: {
    gap: Spacing.sm,
  },
});
