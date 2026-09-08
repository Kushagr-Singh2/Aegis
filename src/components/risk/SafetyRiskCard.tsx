/**
 * SafetyRiskCard — Safety Risk Score and Live Signals
 *
 * Displays:
 * - SAFETY RISK header
 * - Dynamic score: e.g. "32 / 100"
 * - Risk level: LOW (0–29), MODERATE (30–59), HIGH (60–79), CRITICAL (80–100)
 * - Signals:
 *     ✓ Journey active
 *     ⚠ Route deviation
 *     ✓ Normal movement
 *     ✓ Check-in completed
 *
 * The user does NOT enter the score.
 * Includes interactive mock signal toggles for demonstration.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading2, Heading3, BodySmall, Label } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { useJourneyStore, type RiskLevel } from '../../store/useJourneyStore';

const LEVEL_COLORS: Record<RiskLevel, { text: string; bg: string; border: string }> = {
  low: {
    text: Colors.safe.default,
    bg: Colors.safe.tint,
    border: Colors.safe.default,
  },
  moderate: {
    text: Colors.warning.default,
    bg: Colors.warning.tint,
    border: Colors.warning.default,
  },
  high: {
    text: Colors.danger.default,
    bg: Colors.danger.tint,
    border: Colors.danger.default,
  },
  critical: {
    text: Colors.danger.extreme,
    bg: 'rgba(255, 23, 68, 0.18)',
    border: Colors.danger.extreme,
  },
};

type Props = {
  showDemoToggles?: boolean;
};

export function SafetyRiskCard({ showDemoToggles = true }: Props) {
  const riskScore = useJourneyStore((s) => s.riskScore);
  const riskLevel = useJourneyStore((s) => s.riskLevel);
  const signals = useJourneyStore((s) => s.signals);
  const updateSignal = useJourneyStore((s) => s.updateSignal);
  const status = useJourneyStore((s) => s.status);

  const [togglesOpen, setTogglesOpen] = useState(false);

  const levelTheme = LEVEL_COLORS[riskLevel] ?? LEVEL_COLORS.low;
  const isSOSActive = status === 'sos';

  return (
    <Card variant="default" padding="md" style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Label style={styles.headerLabel}>SAFETY RISK</Label>
          <View style={styles.scoreRow}>
            <Heading2 style={[styles.scoreValue, { color: levelTheme.text }]}>
              {riskScore}
            </Heading2>
            <Heading3 style={styles.scoreMax}> / 100</Heading3>
          </View>
        </View>

        <View style={[styles.levelBadge, { backgroundColor: levelTheme.bg, borderColor: levelTheme.border }]}>
          <View style={[styles.levelDot, { backgroundColor: levelTheme.text }]} />
          <Label style={[styles.levelText, { color: levelTheme.text }]}>
            {riskLevel.toUpperCase()}
          </Label>
        </View>
      </View>

      {/* Visual meter bar */}
      <View style={styles.meterContainer}>
        <View
          style={[
            styles.meterFill,
            { width: `${Math.min(riskScore, 100)}%`, backgroundColor: levelTheme.text },
          ]}
        />
      </View>

      {/* Signals breakdown */}
      <View style={styles.signalsList}>
        {/* Signal 1: Journey active */}
        <SignalRow
          isActive={signals.journeyActive}
          positiveLabel="Journey active"
          negativeLabel="Journey inactive"
          positiveIcon="check"
          negativeIcon="close"
          isWarning={!signals.journeyActive}
        />

        {/* Signal 2: Route deviation */}
        <SignalRow
          isActive={!signals.routeDeviation}
          positiveLabel="On planned route"
          negativeLabel="Route deviation"
          positiveIcon="check"
          negativeIcon="alert"
          isWarning={signals.routeDeviation}
        />

        {/* Signal 3: Normal movement */}
        <SignalRow
          isActive={signals.normalMovement}
          positiveLabel="Normal movement"
          negativeLabel="Motion anomaly"
          positiveIcon="check"
          negativeIcon="alert"
          isWarning={!signals.normalMovement}
        />

        {/* Signal 4: Check-in completed */}
        <SignalRow
          isActive={signals.checkInCompleted}
          positiveLabel="Check-in completed"
          negativeLabel="Missed check-in"
          positiveIcon="check"
          negativeIcon="alert"
          isWarning={!signals.checkInCompleted}
        />
      </View>

      {isSOSActive && (
        <View style={styles.overrideBanner}>
          <MaterialCommunityIcons name="shield-alert" size={14} color={Colors.danger.extreme} />
          <BodySmall style={styles.overrideText}>
            Manual SOS confirmed — AI risk overridden to CRITICAL
          </BodySmall>
        </View>
      )}

      {/* Mock Signal Controls for Phase 3 Testing */}
      {showDemoToggles && (
        <View style={styles.demoSection}>
          <TouchableOpacity
            style={styles.toggleHeader}
            onPress={() => setTogglesOpen((v) => !v)}
            activeOpacity={0.7}
          >
            <Label style={styles.demoTitle}>MOCK SIGNAL CHANGES</Label>
            <MaterialCommunityIcons
              name={togglesOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.text.tertiary}
            />
          </TouchableOpacity>

          {togglesOpen && (
            <View style={styles.toggleButtonsGrid}>
              <TouchableOpacity
                style={[styles.toggleBtn, signals.routeDeviation && styles.toggleBtnActive]}
                onPress={() => updateSignal('routeDeviation', !signals.routeDeviation)}
              >
                <BodySmall style={{ color: signals.routeDeviation ? Colors.warning.default : Colors.text.secondary }}>
                  {signals.routeDeviation ? '⚠ Dev On' : '✓ Normal Route'}
                </BodySmall>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, !signals.normalMovement && styles.toggleBtnActive]}
                onPress={() => updateSignal('normalMovement', !signals.normalMovement)}
              >
                <BodySmall style={{ color: !signals.normalMovement ? Colors.warning.default : Colors.text.secondary }}>
                  {!signals.normalMovement ? '⚠ Motion Flaw' : '✓ Motion OK'}
                </BodySmall>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, !signals.checkInCompleted && styles.toggleBtnActive]}
                onPress={() => updateSignal('checkInCompleted', !signals.checkInCompleted)}
              >
                <BodySmall style={{ color: !signals.checkInCompleted ? Colors.danger.default : Colors.text.secondary }}>
                  {!signals.checkInCompleted ? '⚠ Missed Check-in' : '✓ Check-in OK'}
                </BodySmall>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

function SignalRow({
  isActive,
  positiveLabel,
  negativeLabel,
  positiveIcon,
  negativeIcon,
  isWarning,
}: {
  isActive: boolean;
  positiveLabel: string;
  negativeLabel: string;
  positiveIcon: 'check' | 'close' | 'alert';
  negativeIcon: 'check' | 'close' | 'alert';
  isWarning: boolean;
}) {
  const iconName = isWarning ? 'alert' : 'check';
  const iconColor = isWarning ? Colors.warning.default : Colors.safe.default;
  const label = isWarning ? negativeLabel : positiveLabel;

  return (
    <View style={signalStyles.row}>
      <View style={[signalStyles.iconBox, { backgroundColor: isWarning ? Colors.warning.tint : Colors.safe.tint }]}>
        <MaterialCommunityIcons name={iconName} size={13} color={iconColor} />
      </View>
      <BodySmall style={[signalStyles.text, isWarning && { color: Colors.warning.default }]}>
        {label}
      </BodySmall>
    </View>
  );
}

const signalStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  iconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.text.primary,
    fontSize: 13,
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface.primary,
    gap: Spacing.sm + 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    gap: 2,
  },
  headerLabel: {
    color: Colors.text.tertiary,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 18,
    color: Colors.text.tertiary,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  levelText: {
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  meterContainer: {
    height: 6,
    backgroundColor: Colors.surface.secondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  signalsList: {
    gap: 6,
    marginTop: 2,
  },
  overrideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 23, 68, 0.12)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.danger.extreme,
  },
  overrideText: {
    color: Colors.danger.extreme,
    fontSize: 11,
    fontWeight: '600',
  },
  demoSection: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.subtle,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  demoTitle: {
    color: Colors.text.tertiary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  toggleButtonsGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  toggleBtnActive: {
    borderColor: Colors.warning.default,
    backgroundColor: Colors.warning.tint,
  },
});
