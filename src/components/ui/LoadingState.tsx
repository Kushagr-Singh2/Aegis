/**
 * LoadingState — Reusable loading indicator
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native';
import { BodySecondary } from './Typography';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

type LoadingStateProps = {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
};

export function LoadingState({
  message = 'Loading...',
  size = 'large',
  color = Colors.brand.primary,
  style,
}: LoadingStateProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message ? (
        <BodySecondary align="center" style={styles.message}>
          {message}
        </BodySecondary>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  message: {
    marginTop: Spacing.xs,
  },
});
