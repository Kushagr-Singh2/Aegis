/**
 * ActiveJourneySheet — Bottom sheet for the Active Journey screen
 *
 * Displays:
 * - Status pill (on route / deviation / anomaly / critical)
 * - ETA, Distance, Traffic, Safety metrics grid
 * - VIEW ROUTE and END JOURNEY buttons
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading3, BodySmall, Label } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Divider } from '../ui/Divider';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/spacing';
import type { SafetyScenarioConfig } from '../../lib/mockData';
import type { MockRoute } from '../../lib/mockData';

type Props = {
  scenario: SafetyScenarioConfig;
  route: MockRoute | null;
  onViewRoute?: () => void;
  onEndJourney: () => void;
};

const RISK_COLORS: Record<string, string> = {
  low: Colors.safe.default,
  moderate: Colors.warning.default,
  high: Colors.danger.default,
  critical: Colors.danger.extreme,
};

export function ActiveJourneySheet({
  scenario,
  route,
  onViewRoute,
  onEndJourney,
}: Props) {
  const riskColor = RISK_COLORS[scenario.riskLevel] ?? Colors.safe.default;

  return (
    <View style={styles.sheet}>
      {/* Handle */}
      <View style={styles.handle} />

      {/* Status pill */}
      <View style={[styles.statusPill, { borderColor: riskColor, backgroundColor: `${riskColor}18` }]}>
        <View style={[styles.statusDot, { backgroundColor: riskColor }]} />
        <Heading3 style={[styles.statusText, { color: riskColor }]}>
          {scenario.statusEmoji} {scenario.statusPill}
        </Heading3>
      </View>

      <Divider marginVertical={12} />

      {/* Metrics grid */}
      <View style={styles.metricsGrid}>
        <MetricItem
          icon="clock-fast"
          label="ETA"
          value={route?.eta ?? '24 min'}
          color={Colors.text.primary}
        />
        <MetricItem
          icon="map-marker-distance"
          label="Distance"
          value={route?.distance ?? '8.2 km'}
          color={Colors.text.primary}
        />
        <MetricItem
          icon="car-speed-limiter"
          label="Traffic"
          value={route?.traffic ?? 'Moderate'}
          color={
            route?.traffic === 'Heavy'
              ? Colors.danger.default
              : route?.traffic === 'Low'
              ? Colors.safe.default
              : Colors.warning.default
          }
        />
        <MetricItem
          icon="shield-half-full"
          label="Safety"
          value={scenario.riskLabel}
          color={riskColor}
        />
      </View>

      <Divider marginVertical={12} />

      {/* Action buttons */}
      <View style={styles.actions}>
        <View style={styles.viewRouteBtn}>
          <Button
            label="VIEW ROUTE"
            variant="secondary"
            size="md"
            onPress={onViewRoute}
            leftIcon={
              <MaterialCommunityIcons
                name="map-outline"
                size={18}
                color={Colors.brand.primary}
              />
            }
          />
        </View>
        <View style={styles.endJourneyBtn}>
          <Button
            label="END JOURNEY"
            variant="danger"
            size="md"
            onPress={onEndJourney}
            leftIcon={
              <MaterialCommunityIcons
                name="stop-circle-outline"
                size={18}
                color={Colors.white}
              />
            }
          />
        </View>
      </View>
    </View>
  );
}

function MetricItem({
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
    <View style={metricStyles.item}>
      <MaterialCommunityIcons name={icon as any} size={16} color={Colors.text.secondary} />
      <Label style={metricStyles.label}>{label}</Label>
      <BodySmall style={[metricStyles.value, { color }]} numberOfLines={1}>
        {value}
      </BodySmall>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
  },
  value: {
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.background.elevated,
    borderTopLeftRadius: BorderRadius.modal,
    borderTopRightRadius: BorderRadius.modal,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderColor: Colors.border.default,
    ...Shadow.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border.strong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  viewRouteBtn: {
    flex: 1,
  },
  endJourneyBtn: {
    flex: 1,
  },
});
