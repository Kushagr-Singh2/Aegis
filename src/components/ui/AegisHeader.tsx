/**
 * AegisHeader — Home screen branding header
 *
 * Requirements:
 * - Brand: AEGIS
 * - Greeting: Good evening, [User]
 * - Tagline: "Your journey, your safety."
 * - Emergency quick trigger / Status badge
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { DisplayLarge, Heading2, BodySecondary, Label } from './Typography';
import { StatusBadge } from './StatusBadge';
import { EmergencyButton } from './EmergencyButton';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';

type AegisHeaderProps = {
  userName?: string;
  onPressSOS?: () => void;
  style?: ViewStyle;
};

export function AegisHeader({
  userName = 'User',
  onPressSOS,
  style,
}: AegisHeaderProps) {
  const journeyInfo = useJourneyStatus();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, style]}>
      {/* Top Bar: Brand + Quick SOS trigger */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <DisplayLarge style={styles.brandTitle}>AEGIS</DisplayLarge>
          <StatusBadge
            label={journeyInfo.statusLabel}
            variant={
              journeyInfo.isSOSActive
                ? 'sos'
                : journeyInfo.isActive
                ? 'active'
                : 'idle'
            }
          />
        </View>
        {onPressSOS ? (
          <EmergencyButton size="compact" onPress={onPressSOS} />
        ) : null}
      </View>

      {/* Greeting & Tagline */}
      <View style={styles.greetingSection}>
        <Heading2 style={styles.greetingText}>
          {getGreeting()}, {userName}
        </Heading2>
        <BodySecondary style={styles.tagline}>
          "Your journey, your safety."
        </BodySecondary>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandTitle: {
    letterSpacing: 3,
    fontSize: 26,
    lineHeight: 30,
    color: Colors.text.primary,
  },
  greetingSection: {
    marginTop: 2,
  },
  greetingText: {
    fontSize: 20,
    lineHeight: 26,
    color: Colors.text.primary,
  },
  tagline: {
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 2,
    fontSize: 13,
  },
});
