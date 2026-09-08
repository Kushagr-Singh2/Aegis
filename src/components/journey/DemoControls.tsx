/**
 * DemoControls — DEV-ONLY safety scenario switcher
 *
 * Clearly marked as a development tool.
 * Simulates the 5 safety scenarios for testing the UI states.
 *
 * ⚠️ REMOVE or gate behind __DEV__ before production.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Label, BodySmall } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { MOCK_SAFETY_SCENARIOS, type SafetyScenario } from '../../lib/mockData';

const SCENARIO_COLORS: Record<string, string> = {
  normal: Colors.safe.default,
  route_deviation: Colors.warning.default,
  motion_anomaly: Colors.warning.default,
  missed_checkin: Colors.danger.default,
  critical: Colors.danger.extreme,
};

type Props = {
  currentScenario: SafetyScenario;
  onSelectScenario: (s: SafetyScenario) => void;
};

export function DemoControls({ currentScenario, onSelectScenario }: Props) {
  return (
    <View style={styles.container}>
      {/* DEV badge header */}
      <View style={styles.header}>
        <View style={styles.devBadge}>
          <MaterialCommunityIcons name="code-tags" size={12} color={Colors.warning.default} />
          <Label style={styles.devLabel}>⚙️ DEV ONLY — Demo Controls</Label>
        </View>
        <BodySmall color={Colors.text.tertiary} style={styles.devNote}>
          Simulates safety states. Not shown in production.
        </BodySmall>
      </View>

      {/* Scenario buttons */}
      <View style={styles.buttons}>
        {MOCK_SAFETY_SCENARIOS.map((s) => {
          const isActive = currentScenario === s.key;
          const color = SCENARIO_COLORS[s.key] ?? Colors.brand.primary;
          return (
            <TouchableOpacity
              key={s.key}
              style={[
                styles.btn,
                { borderColor: isActive ? color : Colors.border.default },
                isActive && { backgroundColor: `${color}18` },
              ]}
              onPress={() => onSelectScenario(s.key)}
              activeOpacity={0.7}
            >
              <BodySmall
                style={[
                  styles.btnLabel,
                  { color: isActive ? color : Colors.text.secondary },
                ]}
                numberOfLines={2}
              >
                {s.statusEmoji} {s.label}
              </BodySmall>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.warning.default,
    borderStyle: 'dashed',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    gap: 4,
  },
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  devLabel: {
    color: Colors.warning.default,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  devNote: {
    fontSize: 11,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  btn: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    minWidth: 90,
    alignItems: 'center',
  },
  btnLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});
