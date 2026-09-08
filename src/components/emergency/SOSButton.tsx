/**
 * SOSButton — Large emergency trigger button
 *
 * CRITICAL UI element — must be:
 * - Unmissable (large, high contrast)
 * - Resistant to accidental activation (hold to confirm)
 * - Extremely clear about what it does
 *
 * Hold behavior: user must hold 2 seconds to confirm SOS.
 * Shows countdown ring animation.
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Vibration,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useJourneyStore } from '../../store/useJourneyStore';
import { Heading2, Heading3, BodySecondary, Body } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { Spacing, Shadow } from '../../constants/spacing';

// ── Constants ────────────────────────────────────────────────────────────────

const HOLD_DURATION_MS = 2000;
const BUTTON_SIZE = 200;
const RING_SIZE = BUTTON_SIZE + 24;

// ── Component ────────────────────────────────────────────────────────────────

export function SOSButton() {
  const status = useJourneyStore((s) => s.status);
  const triggerSOS = useJourneyStore((s) => s.triggerSOS);
  const cancelSOS = useJourneyStore((s) => s.cancelSOS);

  const isSOSActive = status === 'sos';

  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    holdTimerRef.current = null;
    progressTimerRef.current = null;
  }, []);

  const startHold = useCallback(() => {
    if (isSOSActive) return;
    Vibration.vibrate(50);
    setIsHolding(true);
    setHoldProgress(0);
    progressAnim.setValue(0);

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      useNativeDriver: false,
    }).start();

    // Interval to update progress display
    let elapsed = 0;
    progressTimerRef.current = setInterval(() => {
      elapsed += 100;
      setHoldProgress(Math.min(elapsed / HOLD_DURATION_MS, 1));
    }, 100);

    // Trigger SOS after hold duration
    holdTimerRef.current = setTimeout(() => {
      clearAllTimers();
      setIsHolding(false);
      setHoldProgress(0);
      progressAnim.setValue(0);
      Vibration.vibrate([0, 100, 100, 100, 100, 200]);
      triggerSOS();
    }, HOLD_DURATION_MS);
  }, [isSOSActive, triggerSOS, clearAllTimers, progressAnim, scaleAnim]);

  const cancelHold = useCallback(() => {
    if (!isHolding) return;
    clearAllTimers();
    setIsHolding(false);
    setHoldProgress(0);
    progressAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [isHolding, clearAllTimers, progressAnim, scaleAnim]);

  // ── Render: SOS Active ───────────────────────────────────────────────────

  if (isSOSActive) {
    return (
      <View style={styles.sosActiveContainer}>
        {/* Pulsing ring */}
        <View style={styles.sosActiveRing}>
          <View style={styles.sosActiveButton}>
            <MaterialCommunityIcons name="alert" size={48} color={Colors.white} />
            <Heading2 style={styles.sosActiveLabel}>SOS ACTIVE</Heading2>
          </View>
        </View>

        {/* Cancel SOS */}
        <View style={styles.cancelContainer}>
          <TouchableWithoutFeedback onPress={cancelSOS}>
            <View style={styles.cancelButton}>
              <MaterialCommunityIcons name="close" size={20} color={Colors.text.secondary} />
              <Body color={Colors.text.secondary}>Cancel SOS</Body>
            </View>
          </TouchableWithoutFeedback>
          <BodySecondary align="center" style={styles.cancelNote}>
            Emergency contacts have been notified.{'\n'}Cancel only if you are safe.
          </BodySecondary>
        </View>
      </View>
    );
  }

  // ── Render: Normal ───────────────────────────────────────────────────────

  const progressDeg = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Instruction */}
      <BodySecondary align="center" style={styles.instruction}>
        {isHolding
          ? `Hold for ${Math.ceil((1 - holdProgress) * (HOLD_DURATION_MS / 1000))}s to trigger SOS`
          : 'Hold to trigger SOS'}
      </BodySecondary>

      {/* Ring container */}
      <View style={styles.ringContainer}>
        {/* Progress ring (animated border) */}
        {isHolding && (
          <Animated.View
            style={[
              styles.progressRing,
              {
                borderTopColor: Colors.danger.default,
                transform: [{ rotate: progressDeg }],
              },
            ]}
          />
        )}

        {/* Outer ring (static) */}
        <View style={[styles.outerRing, isHolding && styles.outerRingActive]} />

        {/* Main button */}
        <Animated.View
          style={[
            styles.buttonWrapper,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <TouchableWithoutFeedback
            onPressIn={startHold}
            onPressOut={cancelHold}
          >
            <View
              style={[
                styles.button,
                isHolding && styles.buttonActive,
                Shadow.danger as object,
              ]}
            >
              <MaterialCommunityIcons
                name="alert-octagon"
                size={52}
                color={Colors.white}
              />
              <Heading3 style={styles.sosLabel}>SOS</Heading3>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>

      {/* Status note */}
      <BodySecondary align="center" style={styles.statusNote}>
        {status === 'idle'
          ? 'Start a journey to enable journey protection'
          : 'Journey protection is active'}
      </BodySecondary>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  instruction: {
    paddingHorizontal: Spacing.xl,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.danger.tint,
  },
  outerRingActive: {
    borderColor: Colors.danger.default,
  },
  progressRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 3,
    borderColor: Colors.transparent,
    borderTopColor: Colors.danger.default,
  },
  buttonWrapper: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.danger.default,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  buttonActive: {
    backgroundColor: Colors.danger.dark,
  },
  sosLabel: {
    color: Colors.white,
    letterSpacing: 4,
  },
  statusNote: {
    paddingHorizontal: Spacing.xl,
  },
  // SOS Active state
  sosActiveContainer: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  sosActiveRing: {
    width: RING_SIZE + 16,
    height: RING_SIZE + 16,
    borderRadius: (RING_SIZE + 16) / 2,
    borderWidth: 3,
    borderColor: Colors.danger.default,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger.tint,
  },
  sosActiveButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.danger.default,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sosActiveLabel: {
    color: Colors.white,
    letterSpacing: 2,
  },
  cancelContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  cancelNote: {
    paddingHorizontal: Spacing.xl,
  },
});
