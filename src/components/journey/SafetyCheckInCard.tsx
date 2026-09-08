/**
 * SafetyCheckInCard — In-journey safety verification prompt
 *
 * During active journey:
 * - Shows "ARE YOU SAFE?"
 * - Live countdown timer
 * - [ I'M SAFE ] and [ SOS ] buttons
 * - When user responds: "✓ CHECK-IN RECORDED"
 * - If timeout: "⚠ MISSED CHECK-IN" (increases mock risk, never auto-calls)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading2, Heading3, BodySmall, Label } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { useJourneyStore } from '../../store/useJourneyStore';

const COUNTDOWN_SECONDS = 30;

type Props = {
  onTriggerSOS?: () => void;
};

export function SafetyCheckInCard({ onTriggerSOS }: Props) {
  const checkInStatus = useJourneyStore((s) => s.checkInStatus);
  const recordCheckInSafe = useJourneyStore((s) => s.recordCheckInSafe);
  const triggerMissedCheckIn = useJourneyStore((s) => s.triggerMissedCheckIn);
  const promptCheckIn = useJourneyStore((s) => s.promptCheckIn);
  const startSOSConfirmation = useJourneyStore((s) => s.startSOSConfirmation);

  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start countdown on mount or reset
  const startTimer = useCallback(() => {
    stopTimer();
    setSecondsRemaining(COUNTDOWN_SECONDS);
    promptCheckIn();

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          stopTimer();
          // Timeout occurred: trigger missed check-in (never auto-calls)
          triggerMissedCheckIn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer, promptCheckIn, triggerMissedCheckIn]);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []);

  const handleImSafe = () => {
    stopTimer();
    recordCheckInSafe();
  };

  const handleSOSPress = () => {
    stopTimer();
    if (onTriggerSOS) {
      onTriggerSOS();
    } else {
      startSOSConfirmation();
    }
  };

  const progressPercent = (secondsRemaining / COUNTDOWN_SECONDS) * 100;
  const isDangerTime = secondsRemaining <= 10;

  // Render Recorded state
  if (checkInStatus === 'recorded') {
    return (
      <Card variant="safe" padding="md" style={styles.card}>
        <View style={styles.recordedHeader}>
          <View style={styles.recordedIconBox}>
            <MaterialCommunityIcons name="check-circle" size={24} color={Colors.safe.default} />
          </View>
          <View style={styles.recordedText}>
            <Heading3 style={{ color: Colors.safe.default }}>✓ CHECK-IN RECORDED</Heading3>
            <BodySmall color={Colors.text.secondary}>
              Safety confirmed. Risk score lowered.
            </BodySmall>
          </View>
          <TouchableOpacity style={styles.resetBtn} onPress={startTimer}>
            <MaterialCommunityIcons name="refresh" size={16} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  // Render Missed state
  if (checkInStatus === 'missed' || secondsRemaining === 0) {
    return (
      <Card variant="danger" padding="md" style={styles.card}>
        <View style={styles.missedHeader}>
          <MaterialCommunityIcons name="alert-circle" size={28} color={Colors.danger.default} />
          <View style={styles.missedText}>
            <Heading3 style={{ color: Colors.danger.default }}>⚠ MISSED CHECK-IN</Heading3>
            <BodySmall color={Colors.text.secondary}>
              No response within {COUNTDOWN_SECONDS}s. Mock risk elevated. No automatic calls placed.
            </BodySmall>
          </View>
        </View>
        <View style={styles.missedActions}>
          <Button
            label="I'M SAFE NOW"
            variant="primary"
            size="sm"
            onPress={handleImSafe}
            leftIcon={<MaterialCommunityIcons name="shield-check" size={16} color={Colors.white} />}
          />
          <Button
            label="SOS"
            variant="danger"
            size="sm"
            onPress={handleSOSPress}
            leftIcon={<MaterialCommunityIcons name="alert-octagon" size={16} color={Colors.white} />}
          />
        </View>
      </Card>
    );
  }

  // Render Active Prompt State
  return (
    <Card variant="warning" padding="md" style={styles.card}>
      {/* Title & Countdown */}
      <View style={styles.promptHeader}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="shield-alert-outline"
            size={22}
            color={isDangerTime ? Colors.danger.default : Colors.warning.default}
          />
          <Heading3 style={styles.promptTitle}>ARE YOU SAFE?</Heading3>
        </View>

        <View style={[styles.timerBadge, isDangerTime && styles.timerBadgeDanger]}>
          <MaterialCommunityIcons
            name="timer-sand"
            size={14}
            color={isDangerTime ? Colors.danger.default : Colors.warning.default}
          />
          <Label style={[styles.timerText, isDangerTime && { color: Colors.danger.default }]}>
            {secondsRemaining}s
          </Label>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progressPercent}%`,
              backgroundColor: isDangerTime ? Colors.danger.default : Colors.warning.default,
            },
          ]}
        />
      </View>

      <BodySmall color={Colors.text.secondary} style={styles.promptSubtitle}>
        Confirm your safety before timer expires to avoid elevated risk.
      </BodySmall>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <View style={styles.btnWrap}>
          <Button
            label="I'M SAFE"
            variant="primary"
            size="md"
            onPress={handleImSafe}
            leftIcon={<MaterialCommunityIcons name="check" size={18} color={Colors.white} />}
          />
        </View>
        <View style={styles.btnWrap}>
          <Button
            label="SOS"
            variant="danger"
            size="md"
            onPress={handleSOSPress}
            leftIcon={<MaterialCommunityIcons name="alert-octagon" size={18} color={Colors.white} />}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  promptTitle: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning.tint,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.badge,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.warning.default,
  },
  timerBadgeDanger: {
    backgroundColor: Colors.danger.tint,
    borderColor: Colors.danger.default,
  },
  timerText: {
    color: Colors.warning.default,
    fontWeight: '700',
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surface.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  promptSubtitle: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 2,
  },
  btnWrap: {
    flex: 1,
  },
  // Recorded state
  recordedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recordedIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.safe.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordedText: {
    flex: 1,
  },
  resetBtn: {
    padding: Spacing.xs,
  },
  // Missed state
  missedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  missedText: {
    flex: 1,
  },
  missedActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
