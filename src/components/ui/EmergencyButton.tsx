/**
 * EmergencyButton — Persistent SOS emergency trigger
 *
 * Requirements:
 * - Text: SOS
 * - Immediately visible and easy to tap
 * - Does NOT make any call
 * - Triggers SOS confirmation modal/placeholder
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading3, Label } from './Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/spacing';
import { FontFamily, FontSize } from '../../constants/typography';

type EmergencyButtonProps = {
  onPress: () => void;
  size?: 'compact' | 'standard' | 'floating';
  style?: ViewStyle;
};

export function EmergencyButton({
  onPress,
  size = 'standard',
  style,
}: EmergencyButtonProps) {
  if (size === 'floating') {
    return (
      <TouchableOpacity
        style={[styles.floatingButton, Shadow.danger as ViewStyle, style]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Emergency SOS"
      >
        <MaterialCommunityIcons name="alert-octagon" size={24} color={Colors.white} />
        <Heading3 style={styles.floatingText}>SOS</Heading3>
      </TouchableOpacity>
    );
  }

  if (size === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactButton, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.compactDot} />
        <Heading3 style={styles.compactText}>SOS</Heading3>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.standardButton, Shadow.danger as ViewStyle, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Emergency SOS"
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="alert-octagon" size={24} color={Colors.white} />
      </View>
      <View style={styles.textColumn}>
        <Heading3 style={styles.standardTitle}>SOS</Heading3>
        <Label style={styles.standardSubtitle}>EMERGENCY ASSISTANCE</Label>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={Colors.white}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  standardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger.default,
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.danger.light,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  standardTitle: {
    color: Colors.white,
    fontFamily: FontFamily.displayBold,
    letterSpacing: 2,
    fontSize: 18,
  },
  standardSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
    fontSize: 10,
    marginTop: 1,
  },
  floatingButton: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 84, // Above bottom navigation
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger.default,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    zIndex: 99,
  },
  floatingText: {
    color: Colors.white,
    fontFamily: FontFamily.displayBold,
    letterSpacing: 1.5,
    fontSize: FontSize.md,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger.tint,
    borderColor: Colors.danger.default,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.badge,
    gap: 6,
  },
  compactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger.default,
  },
  compactText: {
    color: Colors.danger.default,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.displayBold,
    letterSpacing: 1,
  },
});
