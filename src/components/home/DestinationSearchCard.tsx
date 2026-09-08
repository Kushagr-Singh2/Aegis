/**
 * DestinationSearchCard — Large Destination Search Card
 *
 * Requirements:
 * - Large destination card
 * - Header: WHERE ARE YOU GOING?
 * - Search bar: [ 🔍 Search destination ]
 * - Supports displaying selected destination with clear/change action
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Heading2, Body, BodySmall, Label } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import type { JourneyDestination } from '../../store/useJourneyStore';

type DestinationSearchCardProps = {
  selectedDestination?: JourneyDestination | null;
  onPressSearch: () => void;
  onClearDestination?: () => void;
  style?: ViewStyle;
};

export function DestinationSearchCard({
  selectedDestination,
  onPressSearch,
  onClearDestination,
  style,
}: DestinationSearchCardProps) {
  return (
    <Card
      variant={selectedDestination ? 'safe' : 'default'}
      padding="md"
      style={[styles.card, style]}
    >
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: selectedDestination
                  ? Colors.safe.default
                  : Colors.brand.primary,
              },
            ]}
          />
          <Label style={styles.headerLabel}>DESTINATION</Label>
        </View>

        {selectedDestination && onClearDestination ? (
          <TouchableOpacity
            onPress={onClearDestination}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BodySmall color={Colors.text.tertiary}>Change</BodySmall>
          </TouchableOpacity>
        ) : null}
      </View>

      <Heading2 style={styles.title}>WHERE ARE YOU GOING?</Heading2>

      {selectedDestination ? (
        <View style={styles.selectedContainer}>
          <View style={styles.selectedIconCircle}>
            <MaterialCommunityIcons
              name="map-marker-check"
              size={24}
              color={Colors.safe.default}
            />
          </View>
          <View style={styles.selectedTextContainer}>
            <Body style={styles.selectedName} numberOfLines={1}>
              {selectedDestination.name}
            </Body>
            <BodySmall color={Colors.text.secondary} numberOfLines={1}>
              {selectedDestination.address}
            </BodySmall>
            <View style={styles.metaRow}>
              <BodySmall color={Colors.safe.default}>
                ETA: {selectedDestination.estimatedTime}
              </BodySmall>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.searchBar}
          onPress={onPressSearch}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={Colors.text.tertiary}
          />
          <Body style={styles.searchPlaceholder}>Search destination...</Body>
          <View style={styles.searchIconBadge}>
            <MaterialCommunityIcons
              name="arrow-right"
              size={16}
              color={Colors.text.secondary}
            />
          </View>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerLabel: {
    letterSpacing: 1.2,
  },
  title: {
    letterSpacing: -0.5,
    fontSize: 22,
    lineHeight: 28,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border.default,
    gap: Spacing.sm,
    marginTop: 2,
  },
  searchPlaceholder: {
    flex: 1,
    color: Colors.text.tertiary,
  },
  searchIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.input,
    padding: Spacing.sm + 2,
    gap: Spacing.sm,
    marginTop: 2,
    borderWidth: 1,
    borderColor: Colors.safe.default,
  },
  selectedIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.safe.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTextContainer: {
    flex: 1,
  },
  selectedName: {
    fontWeight: '700',
    color: Colors.text.primary,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
});
