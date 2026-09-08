/**
 * RouteCard — Single selectable route option
 *
 * Displays route label, ETA, traffic, and safety rating.
 * Highlights when selected. Shows "Recommended" badge when applicable.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading3, BodySmall, Label } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import type { MockRoute } from '../../lib/mockData';

type Props = {
  route: MockRoute;
  isSelected: boolean;
  onSelect: () => void;
};

const TRAFFIC_COLOR: Record<MockRoute['traffic'], string> = {
  Heavy: Colors.danger.default,
  Moderate: Colors.warning.default,
  Low: Colors.safe.default,
};

const SAFETY_COLOR: Record<MockRoute['safetyRating'], string> = {
  Moderate: Colors.warning.default,
  Good: Colors.brand.primary,
  Best: Colors.safe.default,
};

export function RouteCard({ route, isSelected, onSelect }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {/* Route label + recommended badge */}
      <View style={styles.header}>
        <Heading3 style={[styles.label, isSelected && styles.labelSelected]}>
          {route.label}
        </Heading3>
        {route.isRecommended && (
          <View style={styles.recommendedBadge}>
            <MaterialCommunityIcons
              name="shield-check"
              size={11}
              color={Colors.safe.default}
            />
            <Label style={styles.recommendedText}>RECOMMENDED</Label>
          </View>
        )}
        {isSelected && (
          <View style={styles.selectedDot}>
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color={Colors.brand.primary}
            />
          </View>
        )}
      </View>

      {/* ETA */}
      <View style={styles.etaRow}>
        <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.text.secondary} />
        <BodySmall style={styles.etaText}>{route.eta}</BodySmall>
        <BodySmall color={Colors.text.tertiary}> · </BodySmall>
        <BodySmall color={Colors.text.secondary}>{route.distance}</BodySmall>
      </View>

      {/* Traffic + Safety row */}
      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <View style={[styles.metaDot, { backgroundColor: TRAFFIC_COLOR[route.traffic] }]} />
          <BodySmall style={{ color: TRAFFIC_COLOR[route.traffic] }}>
            {route.traffic} traffic
          </BodySmall>
        </View>
        <View style={styles.metaPill}>
          <MaterialCommunityIcons
            name="shield-half-full"
            size={12}
            color={SAFETY_COLOR[route.safetyRating]}
          />
          <BodySmall style={{ color: SAFETY_COLOR[route.safetyRating] }}>
            {route.safetyRating}
          </BodySmall>
        </View>
      </View>

      {route.recommendedReason && (
        <BodySmall style={styles.reasonText}>{route.recommendedReason}</BodySmall>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border.default,
    gap: Spacing.xs,
    minWidth: 140,
  },
  cardSelected: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.tint,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  labelSelected: {
    color: Colors.brand.primaryLight,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.safe.tint,
    borderRadius: BorderRadius.badge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.safe.default,
  },
  recommendedText: {
    color: Colors.safe.default,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  selectedDot: {
    marginLeft: 'auto',
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  etaText: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reasonText: {
    color: Colors.safe.default,
    fontSize: 11,
    marginTop: 2,
  },
});
