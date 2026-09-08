/**
 * EmptyState — Reusable empty state view
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading3, BodySecondary } from './Typography';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

type EmptyStateProps = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
};

export function EmptyState({
  icon = 'information-outline',
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={36} color={Colors.text.tertiary} />
      </View>
      <Heading3 align="center" style={styles.title}>
        {title}
      </Heading3>
      {description ? (
        <BodySecondary align="center" style={styles.description}>
          {description}
        </BodySecondary>
      ) : null}
      {action ? <View style={styles.actionContainer}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    marginBottom: 2,
  },
  description: {
    maxWidth: 280,
  },
  actionContainer: {
    marginTop: Spacing.md,
  },
});
