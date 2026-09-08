/**
 * StatusBadge — Journey status indicator pill
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Label } from './Typography';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { Colors } from '../../constants/colors';

// ── Types ────────────────────────────────────────────────────────────────────

type StatusVariant = 'idle' | 'active' | 'warning' | 'sos' | 'arrived' | 'custom';

type StatusBadgeProps = {
  label: string;
  variant?: StatusVariant;
  dotColor?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  showDot?: boolean;
};

// ── Config ───────────────────────────────────────────────────────────────────

const variantConfig: Record<
  Exclude<StatusVariant, 'custom'>,
  { bg: string; text: string; dot: string }
> = {
  idle: {
    bg: Colors.surface.tertiary,
    text: Colors.text.secondary,
    dot: Colors.text.tertiary,
  },
  active: {
    bg: Colors.safe.tint,
    text: Colors.safe.default,
    dot: Colors.safe.default,
  },
  warning: {
    bg: Colors.warning.tint,
    text: Colors.warning.default,
    dot: Colors.warning.default,
  },
  sos: {
    bg: Colors.danger.tint,
    text: Colors.danger.default,
    dot: Colors.danger.default,
  },
  arrived: {
    bg: Colors.brand.tint,
    text: Colors.brand.primary,
    dot: Colors.brand.primary,
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export function StatusBadge({
  label,
  variant = 'idle',
  dotColor,
  backgroundColor,
  textColor,
  style,
  showDot = true,
}: StatusBadgeProps) {
  const config = variant !== 'custom' ? variantConfig[variant] : null;

  const bgColor = backgroundColor ?? config?.bg ?? Colors.surface.tertiary;
  const txtColor = textColor ?? config?.text ?? Colors.text.secondary;
  const dColor = dotColor ?? config?.dot ?? Colors.text.tertiary;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      {showDot && <View style={[styles.dot, { backgroundColor: dColor }]} />}
      <Label style={{ color: txtColor }}>{label}</Label>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.badge,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
