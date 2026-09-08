/**
 * LocationSection — Current location row for search screen
 *
 * Shows mock GPS location with a pulsing dot indicator.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Body, BodySmall } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';

type Props = {
  onPress?: () => void;
};

export function LocationSection({ onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dotOuter}>
        <View style={styles.dotInner} />
      </View>
      <View style={styles.textBlock}>
        <Body style={styles.label}>Current Location</Body>
        <BodySmall color={Colors.text.secondary}>
          Connaught Place, New Delhi · Mock GPS
        </BodySmall>
      </View>
      <MaterialCommunityIcons
        name="crosshairs-gps"
        size={20}
        color={Colors.brand.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border.default,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.sm,
  },
  dotOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(74,144,217,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.brand.primary,
    borderWidth: 2.5,
    borderColor: Colors.white,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontWeight: '600',
  },
});
