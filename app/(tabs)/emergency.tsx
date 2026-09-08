/**
 * Emergency Screen (Phase 4)
 *
 * Comprehensive emergency assistance interface:
 *
 * When SOS is ACTIVE (emergencyStatus === 'ACTIVE' or status === 'sos'):
 * - Header: 🚨 SOS ACTIVE
 * - Risk Score: 87 / 100 CRITICAL
 * - Live status pills: Current Location Updating, Live Location ACTIVE, Contacts NOTIFIED
 * - [ EXPLAIN MY SITUATION ] → AI incident synthesis & timeline
 * - Enhanced Nearby Help:
 *     ⭐ RECOMMENDED SAFE DESTINATION (Shopping Mall, 350m, 5 min walk, Estimated activity: HIGH)
 *     Police Station (800m, 10 min, ↗ NE, Open)
 *     Hospital (1.2km, 14 min, → E, Open)
 *     Nearby Public Places with Estimated activity (LOW, MEDIUM, HIGH) & disclaimer
 * - Action buttons:
 *     - [ CALL 112 ] (Android Intent.ACTION_DIAL tel:112)
 *     - [ CALL TRUSTED CONTACT ] (EmergencyDialer.openDialer)
 *     - [ FIND SAFE PLACE ] (Directions to recommended safe destination)
 *     - [ SHARE LOCATION ]
 *     - [ RESOLVE ]
 *
 * When SOS is NOT active:
 * - Large SOS Trigger button (2-step confirmation with 3-2-1 countdown)
 * - Hands-free Voice SOS card ("🎙 Listening...", "Help me", "Emergency", "SOS")
 * - Direct 112 Emergency Dialer button
 * - Enhanced Nearby Help preview
 * - Trusted Contacts list
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import {
  Heading1,
  Heading2,
  Heading3,
  Body,
  BodySmall,
  BodySecondary,
  Label,
} from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Divider } from '../../src/components/ui/Divider';
import { Colors } from '../../src/constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../src/constants/spacing';
import { EnhancedNearbyHelp } from '../../src/components/emergency/EnhancedNearbyHelp';
import { DirectionsModal } from '../../src/components/emergency/DirectionsModal';
import { VoiceSOSModal } from '../../src/components/emergency/VoiceSOSModal';
import { SituationExplanationModal } from '../../src/components/emergency/SituationExplanationModal';
import { ContactList } from '../../src/components/emergency/ContactList';
import { SOSConfirmationModal } from '../../src/components/emergency/SOSConfirmationModal';
import { useJourneyStore } from '../../src/store/useJourneyStore';
import { EmergencyDialer } from '../../src/lib/EmergencyDialer';
import {
  MOCK_TRUSTED_CONTACTS,
  MOCK_NEARBY_HELP_PLACES,
  type NearbyHelpPlace,
} from '../../lib/mockData';

export default function EmergencyScreen() {
  const router = useRouter();
  const status = useJourneyStore((s) => s.status);
  const emergencyStatus = useJourneyStore((s) => s.emergencyStatus);
  const riskScore = useJourneyStore((s) => s.riskScore);
  const riskLevel = useJourneyStore((s) => s.riskLevel);
  const resolveEmergency = useJourneyStore((s) => s.resolveEmergency);

  // Modals state
  const [isSOSModalVisible, setIsSOSModalVisible] = useState(false);
  const [isVoiceSOSVisible, setIsVoiceSOSVisible] = useState(false);
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);
  const [selectedPlaceForDirections, setSelectedPlaceForDirections] =
    useState<NearbyHelpPlace | null>(null);

  const isSOSActive = status === 'sos' || emergencyStatus === 'ACTIVE';
  const primaryContact = MOCK_TRUSTED_CONTACTS[0];

  const handleCall112 = () => {
    EmergencyDialer.callEmergency();
  };

  const handleCallContact = () => {
    EmergencyDialer.openDialer(primaryContact.phone);
  };

  const handleFindSafePlace = () => {
    // Open directions to the recommended place (Shopping Mall)
    const mall = MOCK_NEARBY_HELP_PLACES.find((p) => p.id === 'place_mall') ?? MOCK_NEARBY_HELP_PLACES[0];
    setSelectedPlaceForDirections(mall);
  };

  const handleShareLocation = async () => {
    try {
      await Share.share({
        message:
          '🚨 AEGIS EMERGENCY ALERT: Priya has triggered SOS. Live location tracking is active: https://aegis.app/track/sos_9842',
      });
    } catch {
      // Fallback
    }
  };

  const handleResolve = () => {
    Alert.alert(
      'Resolve Emergency?',
      'Are you sure you want to end emergency mode? Trusted contacts will be notified that you are safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Resolve',
          style: 'destructive',
          onPress: () => {
            resolveEmergency();
            router.replace('/journey-complete');
          },
        },
      ]
    );
  };

  return (
    <SafeScreen
      variant={isSOSActive ? 'emergency' : 'default'}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isSOSActive ? (
          /* ══════════════════════════════════════════════════════════════
             ACTIVE SOS DASHBOARD
             ══════════════════════════════════════════════════════════════ */
          <View style={styles.activeDashboard}>
            {/* Header: 🚨 SOS ACTIVE */}
            <View style={styles.alertHeader}>
              <View style={styles.pulseDotBox}>
                <View style={styles.pulseDot} />
              </View>
              <Heading1 style={styles.alertTitle}>🚨 SOS ACTIVE</Heading1>
              <BodySecondary style={styles.alertSubtitle}>
                Emergency protocols active. Help dispatch ready.
              </BodySecondary>
            </View>

            {/* Metrics: Risk Score 87 / 100 CRITICAL */}
            <Card variant="danger" padding="md" style={styles.riskCard}>
              <View style={styles.riskCardHeader}>
                <View>
                  <Label style={styles.riskLabel}>RISK SCORE</Label>
                  <View style={styles.scoreRow}>
                    <Heading1 style={styles.scoreNumber}>{riskScore}</Heading1>
                    <Heading3 style={styles.scoreMax}> / 100</Heading3>
                  </View>
                </View>

                <View style={styles.criticalBadge}>
                  <Label style={styles.criticalText}>{riskLevel.toUpperCase()}</Label>
                </View>
              </View>

              <Divider marginVertical={10} />

              {/* Status Indicators: Location, Live Location, Contacts */}
              <View style={styles.statusPillsRow}>
                {/* Current Location: Updating */}
                <View style={styles.statusPill}>
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={14}
                    color={Colors.brand.primary}
                  />
                  <View style={styles.pillTextCol}>
                    <Label style={styles.pillLabel}>Current Location</Label>
                    <BodySmall style={styles.pillValue}>Updating...</BodySmall>
                  </View>
                </View>

                {/* Live Location: ACTIVE */}
                <View style={[styles.statusPill, styles.pillActive]}>
                  <View style={styles.greenDot} />
                  <View style={styles.pillTextCol}>
                    <Label style={styles.pillLabel}>Live Location</Label>
                    <BodySmall style={[styles.pillValue, { color: Colors.safe.default }]}>
                      ACTIVE
                    </BodySmall>
                  </View>
                </View>

                {/* Trusted Contacts: NOTIFIED */}
                <View style={[styles.statusPill, styles.pillNotified]}>
                  <MaterialCommunityIcons
                    name="check-all"
                    size={14}
                    color={Colors.safe.default}
                  />
                  <View style={styles.pillTextCol}>
                    <Label style={styles.pillLabel}>Trusted Contacts</Label>
                    <BodySmall style={[styles.pillValue, { color: Colors.safe.default }]}>
                      NOTIFIED
                    </BodySmall>
                  </View>
                </View>
              </View>
            </Card>

            {/* Phase 4: [ EXPLAIN MY SITUATION ] CTA */}
            <Button
              label="EXPLAIN MY SITUATION"
              variant="secondary"
              size="md"
              onPress={() => setIsExplanationVisible(true)}
              leftIcon={
                <MaterialCommunityIcons
                  name="brain"
                  size={20}
                  color={Colors.brand.primary}
                />
              }
            />

            {/* Phase 4: Enhanced Nearby Help */}
            <EnhancedNearbyHelp
              onSelectPlaceForDirections={(place) => setSelectedPlaceForDirections(place)}
            />

            {/* Action Buttons */}
            <View style={styles.actionButtonsCol}>
              {/* [ CALL 112 ] */}
              <Button
                label="CALL 112"
                variant="danger"
                size="lg"
                onPress={handleCall112}
                leftIcon={
                  <MaterialCommunityIcons
                    name="phone-outgoing"
                    size={22}
                    color={Colors.white}
                  />
                }
              />

              {/* [ CALL TRUSTED CONTACT ] */}
              <Button
                label={`CALL ${primaryContact.name.toUpperCase()}`}
                variant="secondary"
                size="md"
                onPress={handleCallContact}
                leftIcon={
                  <MaterialCommunityIcons
                    name="account-voice"
                    size={20}
                    color={Colors.brand.primary}
                  />
                }
              />

              <View style={styles.twoBtnRow}>
                {/* [ FIND SAFE PLACE ] */}
                <View style={styles.flexBtn}>
                  <Button
                    label="FIND SAFE PLACE"
                    variant="outline"
                    size="sm"
                    onPress={handleFindSafePlace}
                    leftIcon={
                      <MaterialCommunityIcons
                        name="storefront-outline"
                        size={16}
                        color={Colors.text.primary}
                      />
                    }
                  />
                </View>

                {/* [ SHARE LOCATION ] */}
                <View style={styles.flexBtn}>
                  <Button
                    label="SHARE LOCATION"
                    variant="outline"
                    size="sm"
                    onPress={handleShareLocation}
                    leftIcon={
                      <MaterialCommunityIcons
                        name="share-variant-outline"
                        size={16}
                        color={Colors.text.primary}
                      />
                    }
                  />
                </View>
              </View>

              {/* [ RESOLVE ] */}
              <Button
                label="RESOLVE EMERGENCY"
                variant="ghost"
                size="md"
                onPress={handleResolve}
                leftIcon={
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={20}
                    color={Colors.safe.default}
                  />
                }
              />
            </View>
          </View>
        ) : (
          /* ══════════════════════════════════════════════════════════════
             IDLE EMERGENCY PANEL
             ══════════════════════════════════════════════════════════════ */
          <>
            <View style={styles.header}>
              <Label style={styles.headerLabel}>CRITICAL RESPONSE</Label>
              <Heading1>Emergency Assistance</Heading1>
            </View>

            {/* Quick SOS Trigger Button */}
            <View style={styles.idleSosSection}>
              <TouchableOpacity
                style={styles.idleSosButton}
                onPress={() => setIsSOSModalVisible(true)}
                activeOpacity={0.85}
              >
                <View style={styles.idleSosOuterRing}>
                  <View style={styles.idleSosInner}>
                    <MaterialCommunityIcons
                      name="alert-octagon"
                      size={44}
                      color={Colors.white}
                    />
                    <Heading2 style={styles.idleSosText}>SOS</Heading2>
                    <Label style={styles.idleSosSub}>TAP FOR HELP</Label>
                  </View>
                </View>
              </TouchableOpacity>
              <BodySmall align="center" color={Colors.text.tertiary}>
                Opens confirmation with 3-second abortable countdown.
              </BodySmall>
            </View>

            {/* Phase 4: Voice SOS Card */}
            <View style={styles.voiceCardWrap}>
              <Card variant="default" padding="sm" style={styles.voiceCard}>
                <View style={styles.voiceCardRow}>
                  <View style={styles.voiceIconBox}>
                    <MaterialCommunityIcons name="microphone-message" size={22} color={Colors.brand.primary} />
                  </View>
                  <View style={styles.voiceTextCol}>
                    <Body style={styles.voiceTitle}>Voice SOS (Hands-Free)</Body>
                    <BodySmall color={Colors.text.secondary}>
                      Say "Help me", "Emergency", or "SOS"
                    </BodySmall>
                  </View>
                  <TouchableOpacity
                    style={styles.voiceLaunchBtn}
                    onPress={() => setIsVoiceSOSVisible(true)}
                    activeOpacity={0.7}
                  >
                    <BodySmall style={styles.voiceLaunchText}>TEST</BodySmall>
                  </TouchableOpacity>
                </View>
              </Card>
            </View>

            {/* Direct 112 Dialer Button */}
            <View style={styles.directCallContainer}>
              <Button
                label="Open 112 Emergency Dialer"
                variant="danger"
                size="md"
                onPress={handleCall112}
                leftIcon={
                  <MaterialCommunityIcons
                    name="phone-outgoing"
                    size={20}
                    color={Colors.white}
                  />
                }
              />
              <BodySmall align="center" color={Colors.text.tertiary} style={styles.dialerNotice}>
                Complies with Android Intent.ACTION_DIAL (never automatically places calls).
              </BodySmall>
            </View>

            {/* Phase 4: Enhanced Nearby Help Preview */}
            <View style={styles.nearbyHelpWrap}>
              <EnhancedNearbyHelp
                onSelectPlaceForDirections={(place) => setSelectedPlaceForDirections(place)}
              />
            </View>

            {/* Trusted Contacts */}
            <ContactList />
          </>
        )}
      </ScrollView>

      {/* Universal 2-Step SOS Modal */}
      <SOSConfirmationModal
        visible={isSOSModalVisible}
        onClose={() => setIsSOSModalVisible(false)}
      />

      {/* Phase 4: Directions Modal (Route on map) */}
      <DirectionsModal
        visible={selectedPlaceForDirections !== null}
        place={selectedPlaceForDirections}
        onClose={() => setSelectedPlaceForDirections(null)}
      />

      {/* Phase 4: Voice SOS Modal */}
      <VoiceSOSModal
        visible={isVoiceSOSVisible}
        onClose={() => setIsVoiceSOSVisible(false)}
      />

      {/* Phase 4: Explain My Situation Modal */}
      <SituationExplanationModal
        visible={isExplanationVisible}
        onClose={() => setIsExplanationVisible(false)}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerLabel: {
    marginBottom: 2,
  },
  // Active SOS Dashboard
  activeDashboard: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  alertHeader: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  pulseDotBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 23, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.danger.extreme,
  },
  alertTitle: {
    color: Colors.danger.extreme,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  alertSubtitle: {
    textAlign: 'center',
  },
  riskCard: {
    backgroundColor: '#1E0E12',
    borderColor: Colors.danger.extreme,
    borderWidth: 1.5,
  },
  riskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskLabel: {
    color: Colors.text.tertiary,
    fontSize: 10,
    letterSpacing: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    color: Colors.danger.extreme,
    fontSize: 36,
    fontWeight: '900',
  },
  scoreMax: {
    color: Colors.text.tertiary,
    fontSize: 18,
  },
  criticalBadge: {
    backgroundColor: 'rgba(255, 23, 68, 0.25)',
    borderWidth: 1,
    borderColor: Colors.danger.extreme,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: BorderRadius.badge,
  },
  criticalText: {
    color: Colors.danger.extreme,
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 12,
  },
  statusPillsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  statusPill: {
    flex: 1,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.card,
    padding: Spacing.sm,
    gap: 4,
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.default,
  },
  pillActive: {
    borderColor: Colors.safe.default,
  },
  pillNotified: {
    borderColor: Colors.safe.default,
  },
  pillTextCol: {
    gap: 1,
  },
  pillLabel: {
    fontSize: 9,
    color: Colors.text.tertiary,
  },
  pillValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.safe.default,
  },
  actionButtonsCol: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  twoBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
  // Idle State
  idleSosSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  idleSosButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleSosOuterRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(229, 57, 53, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(229, 57, 53, 0.4)',
  },
  idleSosInner: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: Colors.danger.default,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...Shadow.danger,
  },
  idleSosText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  idleSosSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    letterSpacing: 1,
  },
  voiceCardWrap: {
    paddingHorizontal: Spacing.md,
  },
  voiceCard: {
    backgroundColor: Colors.surface.primary,
  },
  voiceCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  voiceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTextCol: {
    flex: 1,
    gap: 2,
  },
  voiceTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  voiceLaunchBtn: {
    backgroundColor: Colors.surface.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  voiceLaunchText: {
    color: Colors.brand.primaryLight,
    fontWeight: '800',
    fontSize: 11,
  },
  directCallContainer: {
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  dialerNotice: {
    fontSize: 11,
    lineHeight: 16,
  },
  nearbyHelpWrap: {
    paddingHorizontal: Spacing.md,
  },
});
