/**
 * SafeScreen — Safe Area wrapper
 *
 * Wraps content in SafeAreaView with AEGIS background color.
 * Use as the outermost container on every screen.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { StatusBar } from 'expo-status-bar';

// ── Types ────────────────────────────────────────────────────────────────────

type SafeScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Use for emergency/SOS screens */
  variant?: 'default' | 'elevated' | 'emergency';
  /** Whether to include horizontal padding */
  padded?: boolean;
  /** Custom background color override */
  backgroundColor?: string;
  /** Whether to apply bottom inset padding (for tab screens) */
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
};

// ── Component ────────────────────────────────────────────────────────────────

export function SafeScreen({
  children,
  style,
  variant = 'default',
  padded = false,
  backgroundColor,
  edges = ['top', 'left', 'right'],
}: SafeScreenProps) {
  const bgColor =
    backgroundColor ??
    (variant === 'elevated'
      ? Colors.background.secondary
      : variant === 'emergency'
        ? Colors.background.primary
        : Colors.background.primary);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: bgColor }, style]}
      edges={edges}
    >
      <StatusBar style="light" />
      <View style={[styles.content, padded && styles.padded]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 16,
  },
});
