/**
 * SOSConfirmationModal — Universal 2-step emergency trigger
 *
 * Requirements:
 * - Works from: Home, Active Journey, Emergency UI
 * - Step 1: "ARE YOU IN DANGER?"
 *     [ ACTIVATE SOS ]
 *     [ I'M SAFE ]
 * - Step 2: 3-second countdown:
 *     3 → 2 → 1
 *     [ CANCEL ]
 * - Then:
 *     emergency.status = ACTIVE
 *     Manual SOS overrides AI risk (87 / 100 CRITICAL)
 *     Navigates to Emergency Screen
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading1, Heading2, Heading3, Body, BodySmall, Label } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/spacing';
import { useJourneyStore } from '../../store/useJourneyStore';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function SOSConfirmationModal({ visible, onClose }: Props) {
  const router = useRouter();
  const confirmSOS = useJourneyStore((s) => s.confirmSOS);

  // 'confirm' | 'countdown'
  const [step, setStep] = useState<'confirm' | 'countdown'>('confirm');
  const [countdown, setCountdown] = useState(3);

  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for countdown
  useEffect(() => {
    if (step === 'countdown') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [step, pulseAnim]);

  // Handle countdown progression
  useEffect(() => {
    if (step === 'countdown' && visible) {
      setCountdown(3);
      Vibration.vibrate(80);

      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            // Activate Emergency!
            Vibration.vibrate([0, 150, 100, 200]);
            confirmSOS('Manual SOS Activation');
            onClose();
            router.push('/(tabs)/emergency');
            return 0;
          }
          Vibration.vibrate(50);
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [step, visible, confirmSOS, onClose, router]);

  // Reset when closing
  const handleCancel = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setStep('confirm');
    setCountdown(3);
    onClose();
  };

  const handleStartCountdown = () => {
    setStep('countdown');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, step === 'countdown' && styles.dialogCountdown]}>
          {step === 'confirm' ? (
            /* ── Step 1: Confirm ─────────────────────────────────────── */
            <View style={styles.content}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="alert-octagon"
                  size={42}
                  color={Colors.danger.default}
                />
              </View>

              <Heading2 style={styles.title} align="center">
                ARE YOU IN DANGER?
              </Heading2>

              <Body align="center" style={styles.description}>
                Activating SOS notifies your trusted contacts with your live location, elevates
                safety monitoring to CRITICAL, and prepares 112 emergency services.
              </Body>

              <View style={styles.actions}>
                <Button
                  label="ACTIVATE SOS"
                  variant="danger"
                  size="lg"
                  onPress={handleStartCountdown}
                  leftIcon={
                    <MaterialCommunityIcons
                      name="alert-octagon"
                      size={22}
                      color={Colors.white}
                    />
                  }
                />

                <Button
                  label="I'M SAFE"
                  variant="secondary"
                  size="md"
                  onPress={handleCancel}
                />
              </View>
            </View>
          ) : (
            /* ── Step 2: 3-2-1 Countdown ─────────────────────────────── */
            <View style={styles.countdownContent}>
              <Label style={styles.countdownWarning}>ACTIVATING EMERGENCY RESPONSE</Label>

              <Animated.View
                style={[
                  styles.countdownNumberBox,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Heading1 style={styles.countdownNumber}>{countdown}</Heading1>
              </Animated.View>

              <BodySmall align="center" style={styles.countdownHint}>
                Emergency SOS will activate when timer reaches zero.
              </BodySmall>

              <View style={styles.cancelBtnWrap}>
                <Button
                  label="CANCEL"
                  variant="secondary"
                  size="lg"
                  onPress={handleCancel}
                  leftIcon={
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color={Colors.text.primary}
                    />
                  }
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.background.elevated,
    borderRadius: BorderRadius.modal,
    borderWidth: 1.5,
    borderColor: Colors.danger.default,
    padding: Spacing.xl,
    ...Shadow.lg,
  },
  dialogCountdown: {
    borderColor: Colors.danger.extreme,
    backgroundColor: '#1C0D11',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.danger.tint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.danger.default,
  },
  title: {
    color: Colors.danger.default,
    fontSize: 22,
    letterSpacing: 1,
    fontWeight: '800',
  },
  description: {
    color: Colors.text.secondary,
    lineHeight: 22,
    fontSize: 14,
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  // Countdown styles
  countdownContent: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  countdownWarning: {
    color: Colors.danger.extreme,
    letterSpacing: 1.5,
    fontSize: 11,
    textAlign: 'center',
  },
  countdownNumberBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.danger.extreme,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.danger,
  },
  countdownNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: Colors.white,
  },
  countdownHint: {
    color: Colors.text.secondary,
    fontSize: 13,
  },
  cancelBtnWrap: {
    width: '100%',
    marginTop: Spacing.sm,
  },
});
