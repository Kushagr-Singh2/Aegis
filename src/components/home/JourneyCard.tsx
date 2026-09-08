/**
 * JourneyCard — Active journey summary on Home screen
 *
 * Shows current journey status, destination, duration, and risk level.
 * Tapping navigates to the Journey tab.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useJourneyStore } from '../../store/useJourneyStore';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Heading3, Body, BodySmall, BodySecondary, Label } from '../ui/Typography';
import { Divider } from '../ui/Divider';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import type { JourneyStatus } from '../../store/useJourneyStore';

// ── Component ────────────────────────────────────────────────────────────────

export function JourneyCard() {
  const router = useRouter();
  const status = useJourneyStore((s) => s.status);
  const destination = useJourneyStore((s) => s.destination);
  const journeyInfo = useJourneyStatus();

  const statusVariantMap: Record<JourneyStatus, 'idle' | 'active' | 'sos' | 'arrived' | 'warning'> = {
    idle: 'idle',
    active: 'active',
    sos: 'sos',
    arrived: 'arrived',
  };

  if (status === 'idle') {
    return <IdleCard onPress={() => router.push('/(tabs)/journey')} />;
  }

  return (
    <Card
      variant={status === 'sos' ? 'danger' : status === 'active' ? 'safe' : 'default'}
      style={styles.card}
      onPress={() => router.push('/(tabs)/journey')}
    >
      {/* Header */}
      <View style={styles.header}>
        <StatusBadge
          label={journeyInfo.statusLabel}
          variant={statusVariantMap[status]}
        />
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => router.push('/(tabs)/journey')}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={Colors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />

      {/* Destination */}
      {destination && (
        <View style={styles.destinationRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={journeyInfo.statusColor}
            style={styles.destinationIcon}
          />
          <View style={styles.destinationText}>
            <Heading3 numberOfLines={1}>{destination.name}</Heading3>
            <BodySmall numberOfLines={1} color={Colors.text.secondary}>
              {destination.address}
            </BodySmall>
          </View>
        </View>
      )}

      <Divider marginVertical={12} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatItem
          icon="clock-outline"
          label="Duration"
          value={journeyInfo.duration}
          iconColor={Colors.text.secondary}
        />
        {journeyInfo.showRiskIndicator && (
          <StatItem
            icon="shield-half-full"
            label="Risk Level"
            value={journeyInfo.riskLabel}
            iconColor={journeyInfo.riskColor}
            valueColor={journeyInfo.riskColor}
          />
        )}
        {destination && (
          <StatItem
            icon="navigation"
            label="ETA"
            value={destination.estimatedTime}
            iconColor={Colors.text.secondary}
          />
        )}
      </View>
    </Card>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function IdleCard({ onPress }: { onPress: () => void }) {
  return (
    <Card variant="default" style={styles.card} onPress={onPress}>
      <View style={styles.idleContent}>
        <View style={styles.idleIconWrapper}>
          <MaterialCommunityIcons
            name="shield-check"
            size={28}
            color={Colors.brand.primary}
          />
        </View>
        <View style={styles.idleText}>
          <Heading3>Start a Journey</Heading3>
          <BodySecondary>
            Journey Protection activates when you start travelling
          </BodySecondary>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={Colors.text.tertiary}
        />
      </View>
    </Card>
  );
}

type StatItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  iconColor?: string;
  valueColor?: string;
};

function StatItem({ icon, label, value, iconColor, valueColor }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <MaterialCommunityIcons
        name={icon}
        size={14}
        color={iconColor ?? Colors.text.secondary}
        style={styles.statIcon}
      />
      <Label>{label}</Label>
      <Body style={{ color: valueColor ?? Colors.text.primary, marginTop: 2 }} numberOfLines={1}>
        {value}
      </Body>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrowButton: {
    padding: 4,
  },
  spacer: {
    height: Spacing.sm,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  destinationIcon: {
    marginTop: 2,
    marginRight: Spacing.sm,
  },
  destinationText: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statIcon: {
    marginBottom: 2,
  },
  // Idle state
  idleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  idleIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleText: {
    flex: 1,
  },
});
