/**
 * QuickActions — Quick action buttons on Home screen
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BodySmall, Label } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { useJourneyStore } from '../../store/useJourneyStore';

// ── Types ────────────────────────────────────────────────────────────────────

type QuickAction = {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  disabled?: boolean;
};

// ── Component ────────────────────────────────────────────────────────────────

export function QuickActions() {
  const router = useRouter();
  const status = useJourneyStore((s) => s.status);
  const isActive = status === 'active' || status === 'sos';

  const actions: QuickAction[] = [
    {
      id: 'share',
      icon: 'share-variant',
      label: 'Share\nJourney',
      color: Colors.brand.primary,
      backgroundColor: Colors.brand.tint,
      onPress: () => router.push('/(tabs)/journey'),
      disabled: !isActive,
    },
    {
      id: 'contacts',
      icon: 'account-group',
      label: 'Trusted\nContacts',
      color: Colors.safe.default,
      backgroundColor: Colors.safe.tint,
      onPress: () => router.push('/(tabs)/emergency'),
    },
    {
      id: 'emergency',
      icon: 'phone-alert',
      label: 'Emergency\n112',
      color: Colors.danger.default,
      backgroundColor: Colors.danger.tint,
      onPress: () => router.push('/(tabs)/emergency'),
    },
    {
      id: 'profile',
      icon: 'shield-account',
      label: 'Safety\nProfile',
      color: Colors.warning.default,
      backgroundColor: Colors.warning.tint,
      onPress: () => router.push('/(tabs)/profile'),
    },
  ];

  return (
    <View style={styles.container}>
      <Label style={styles.sectionLabel}>Quick Actions</Label>
      <View style={styles.grid}>
        {actions.map((action) => (
          <QuickActionButton key={action.id} action={action} />
        ))}
      </View>
    </View>
  );
}

// ── Sub-component ────────────────────────────────────────────────────────────

function QuickActionButton({ action }: { action: QuickAction }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: action.backgroundColor },
        action.disabled && styles.disabled,
      ]}
      onPress={action.disabled ? undefined : action.onPress}
      activeOpacity={action.disabled ? 1 : 0.75}
    >
      <MaterialCommunityIcons
        name={action.icon}
        size={24}
        color={action.disabled ? Colors.text.tertiary : action.color}
        style={styles.icon}
      />
      <BodySmall
        style={[
          styles.label,
          { color: action.disabled ? Colors.text.tertiary : action.color },
        ]}
        align="center"
      >
        {action.label}
      </BodySmall>
    </TouchableOpacity>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  icon: {
    marginBottom: Spacing[1.5],
  },
  label: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
