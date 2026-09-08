/**
 * Card — Reusable surface container
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/spacing';

// ── Types ────────────────────────────────────────────────────────────────────

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'glass' | 'danger' | 'safe' | 'warning';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
};

// ── Component ────────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'md',
  onPress,
}: CardProps) {
  const containerStyle = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`padding_${padding}`],
    ...(variant === 'elevated' ? [Shadow.md as ViewStyle] : []),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Variants
  variant_default: {
    backgroundColor: Colors.surface.primary,
    borderColor: Colors.border.subtle,
  },
  variant_elevated: {
    backgroundColor: Colors.surface.secondary,
    borderColor: Colors.border.default,
  },
  variant_glass: {
    backgroundColor: Colors.surface.glass,
    borderColor: Colors.border.default,
  },
  variant_danger: {
    backgroundColor: Colors.danger.tint,
    borderColor: Colors.danger.default,
  },
  variant_safe: {
    backgroundColor: Colors.safe.tint,
    borderColor: Colors.safe.default,
  },
  variant_warning: {
    backgroundColor: Colors.warning.tint,
    borderColor: Colors.warning.default,
  },

  // Padding
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: Spacing.sm,
  },
  padding_md: {
    padding: Spacing.md,
  },
  padding_lg: {
    padding: Spacing.lg,
  },
});
