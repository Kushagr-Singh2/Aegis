/**
 * DestinationList — Reusable destination row list
 *
 * Used in Destination Search screen for Recent, Favourite,
 * Suggested, and Search Result sections.
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Body, BodySmall } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';

export type DestinationItem = {
  id: string;
  name: string;
  address: string;
  distance?: string;
  estimatedTime?: string;
  icon?: string;
  badge?: string; // e.g. "Based on your routine"
};

type Props = {
  items: DestinationItem[];
  onSelect: (item: DestinationItem) => void;
  iconName?: string; // default fallback icon
  emptyMessage?: string;
};

export function DestinationList({
  items,
  onSelect,
  iconName = 'map-marker-outline',
  emptyMessage = 'No results',
}: Props) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons
          name="map-marker-off"
          size={28}
          color={Colors.text.tertiary}
        />
        <BodySmall color={Colors.text.tertiary}>{emptyMessage}</BodySmall>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => onSelect(item)}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={(item.icon ?? iconName) as any}
              size={19}
              color={Colors.brand.primary}
            />
          </View>
          <View style={styles.textBlock}>
            <Body numberOfLines={1} style={styles.name}>{item.name}</Body>
            <BodySmall color={Colors.text.secondary} numberOfLines={1}>
              {item.address}
            </BodySmall>
            {item.badge ? (
              <View style={styles.badge}>
                <BodySmall style={styles.badgeText}>{item.badge}</BodySmall>
              </View>
            ) : null}
          </View>
          <View style={styles.meta}>
            {item.estimatedTime ? (
              <BodySmall color={Colors.safe.default}>{item.estimatedTime}</BodySmall>
            ) : null}
            {item.distance ? (
              <BodySmall color={Colors.text.tertiary}>{item.distance}</BodySmall>
            ) : null}
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={Colors.text.tertiary}
          />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.subtle,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.brand.tint,
    borderRadius: BorderRadius.badge,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  badgeText: {
    color: Colors.brand.primaryLight,
    fontSize: 10,
  },
  meta: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 2,
  },
  empty: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
