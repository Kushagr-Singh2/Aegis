/**
 * RecentDestinationCard — Quick access for Home, College, Work
 *
 * Requirements:
 * - Section: Recent destinations
 * - Shortcuts: Home, College, Work
 * - Each item is tappable and selects destination
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Heading3, Body, BodySmall, Label } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { MOCK_RECENT_SHORTCUTS } from '../../lib/mockData';
import type { JourneyDestination } from '../../store/useJourneyStore';

type RecentDestinationCardProps = {
  selectedDestinationName?: string | null;
  onSelectDestination: (dest: JourneyDestination) => void;
};

export function RecentDestinationCard({
  selectedDestinationName,
  onSelectDestination,
}: RecentDestinationCardProps) {
  return (
    <View style={styles.container}>
      <Label style={styles.sectionLabel}>RECENT DESTINATIONS</Label>
      <View style={styles.list}>
        {MOCK_RECENT_SHORTCUTS.map((shortcut) => {
          const isSelected = selectedDestinationName === shortcut.title;

          return (
            <TouchableOpacity
              key={shortcut.id}
              style={[
                styles.item,
                isSelected && styles.itemSelected,
              ]}
              onPress={() =>
                onSelectDestination({
                  name: shortcut.title,
                  address: shortcut.subtitle,
                  estimatedTime: shortcut.estimatedTime,
                })
              }
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconCircle,
                  isSelected && styles.iconCircleSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name={shortcut.icon}
                  size={22}
                  color={isSelected ? Colors.brand.primary : Colors.text.secondary}
                />
              </View>

              <View style={styles.textContainer}>
                <Heading3
                  style={[
                    styles.title,
                    isSelected && { color: Colors.brand.primary },
                  ]}
                  numberOfLines={1}
                >
                  {shortcut.title}
                </Heading3>
                <BodySmall color={Colors.text.secondary} numberOfLines={1}>
                  {shortcut.subtitle}
                </BodySmall>
              </View>

              <View style={styles.metaContainer}>
                <BodySmall
                  style={[
                    styles.etaText,
                    isSelected && { color: Colors.brand.primary },
                  ]}
                >
                  {shortcut.estimatedTime}
                </BodySmall>
                <BodySmall color={Colors.text.tertiary}>
                  {shortcut.distance}
                </BodySmall>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  sectionLabel: {
    marginBottom: Spacing.xs,
    letterSpacing: 1.2,
  },
  list: {
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    gap: Spacing.sm,
  },
  itemSelected: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.tint,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: Colors.brand.tint,
    borderWidth: 1,
    borderColor: Colors.brand.primary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
  },
  metaContainer: {
    alignItems: 'flex-end',
  },
  etaText: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
});
