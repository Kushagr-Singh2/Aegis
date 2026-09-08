/**
 * VoiceSOSModal — Hands-free voice emergency trigger
 *
 * Requirements:
 * - States: IDLE, LISTENING, DETECTED, CONFIRMATION, ACTIVATED, CANCELLED, UNAVAILABLE
 * - Shows: "🎙 Listening..."
 * - Possible trigger phrases: "Help me", "Emergency", "SOS"
 * - When detected: "🚨 Emergency phrase detected" with [ ACTIVATE SOS ] and [ CANCEL ]
 * - If unavailable: "Voice SOS unavailable." with [ USE SOS ]
 * - Mock simulation controls for demonstration (no real speech recognition yet)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading2, Heading3, Body, BodySmall, Label } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/spacing';
import { useJourneyStore } from '../../store/useJourneyStore';
import { VOICE_SOS_PHRASES, type VoiceSOSState } from '../../lib/mockData';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function VoiceSOSModal({ visible, onClose }: Props) {
  const router = useRouter();
  const confirmSOS = useJourneyStore((s) => s.confirmSOS);

  const [state, setState] = useState<VoiceSOSState>('LISTENING');
  const [detectedPhrase, setDetectedPhrase] = useState<string>('Help me');

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation while listening
  useEffect(() => {
    if (state === 'LISTENING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  const handleSimulateDetection = (phrase: string) => {
    setDetectedPhrase(phrase);
    setState('CONFIRMATION');
  };

  const handleActivateSOS = () => {
    setState('ACTIVATED');
    confirmSOS(`Voice SOS: "${detectedPhrase}"`);
    onClose();
    router.push('/(tabs)/emergency');
  };

  const handleCancel = () => {
    setState('CANCELLED');
    setTimeout(() => {
      onClose();
      setState('IDLE');
    }, 400);
  };

  const handleManualSOSFallback = () => {
    onClose();
    confirmSOS('Manual SOS fallback from Voice SOS');
    router.push('/(tabs)/emergency');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="microphone-message" size={22} color={Colors.brand.primary} />
              <Heading3 style={styles.title}>VOICE SOS</Heading3>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* ── State 1: LISTENING ──────────────────────────────────────── */}
          {state === 'LISTENING' && (
            <View style={styles.stateContent}>
              <Animated.View
                style={[
                  styles.listeningCircle,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <MaterialCommunityIcons name="microphone" size={44} color={Colors.white} />
              </Animated.View>

              <Heading2 style={styles.listeningText}>🎙 Listening...</Heading2>
              <BodySmall align="center" color={Colors.text.secondary} style={styles.listeningHint}>
                Speak one of the emergency phrases clearly:
              </BodySmall>

              {/* Supported phrases pills */}
              <View style={styles.phrasesRow}>
                {VOICE_SOS_PHRASES.map((phrase) => (
                  <TouchableOpacity
                    key={phrase}
                    style={styles.phraseChip}
                    onPress={() => handleSimulateDetection(phrase)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="waveform" size={12} color={Colors.brand.primaryLight} />
                    <BodySmall style={styles.phraseText}>"{phrase}"</BodySmall>
                  </TouchableOpacity>
                ))}
              </View>

              <BodySmall align="center" color={Colors.text.tertiary} style={styles.tapTip}>
                (Tap any phrase above to simulate detection)
              </BodySmall>

              <View style={styles.actionRow}>
                <Button
                  label="CANCEL LISTENING"
                  variant="secondary"
                  size="md"
                  onPress={handleCancel}
                />
              </View>
            </View>
          )}

          {/* ── State 2: DETECTED / CONFIRMATION ───────────────────────── */}
          {(state === 'DETECTED' || state === 'CONFIRMATION') && (
            <View style={styles.stateContent}>
              <View style={styles.detectedIconBox}>
                <MaterialCommunityIcons name="alert-octagon" size={48} color={Colors.danger.extreme} />
              </View>

              <Heading2 style={styles.detectedTitle} align="center">
                🚨 Emergency phrase detected
              </Heading2>

              <Card variant="danger" padding="sm" style={styles.detectedPhraseCard}>
                <BodySmall color={Colors.text.secondary}>Detected Phrase:</BodySmall>
                <Heading3 style={{ color: Colors.danger.default }}>"{detectedPhrase}"</Heading3>
              </Card>

              <BodySmall align="center" color={Colors.text.secondary}>
                Confirm SOS activation or cancel if this was spoken by mistake.
              </BodySmall>

              <View style={styles.confirmationActions}>
                <Button
                  label="ACTIVATE SOS"
                  variant="danger"
                  size="lg"
                  onPress={handleActivateSOS}
                  leftIcon={
                    <MaterialCommunityIcons name="alert-octagon" size={20} color={Colors.white} />
                  }
                />

                <Button
                  label="CANCEL"
                  variant="secondary"
                  size="md"
                  onPress={handleCancel}
                />
              </View>
            </View>
          )}

          {/* ── State 3: UNAVAILABLE ────────────────────────────────────── */}
          {state === 'UNAVAILABLE' && (
            <View style={styles.stateContent}>
              <View style={styles.unavailableIconBox}>
                <MaterialCommunityIcons name="microphone-off" size={40} color={Colors.warning.default} />
              </View>

              <Heading2 style={styles.unavailableTitle} align="center">
                Voice SOS unavailable.
              </Heading2>

              <BodySmall align="center" color={Colors.text.secondary}>
                Microphone access or offline speech service is not responding. Please use manual SOS.
              </BodySmall>

              <View style={styles.confirmationActions}>
                <Button
                  label="USE SOS"
                  variant="danger"
                  size="lg"
                  onPress={handleManualSOSFallback}
                  leftIcon={
                    <MaterialCommunityIcons name="alert-octagon" size={20} color={Colors.white} />
                  }
                />
                <Button
                  label="CLOSE"
                  variant="secondary"
                  size="md"
                  onPress={onClose}
                />
              </View>
            </View>
          )}

          {/* ── State 4: IDLE ─────────────────────────────────────────── */}
          {state === 'IDLE' && (
            <View style={styles.stateContent}>
              <View style={styles.idleIconBox}>
                <MaterialCommunityIcons name="microphone-outline" size={40} color={Colors.brand.primary} />
              </View>

              <Heading3 align="center">Hands-Free Voice SOS</Heading3>
              <BodySmall align="center" color={Colors.text.secondary}>
                Continuously listens for "Help me", "Emergency", or "SOS" while journey protection is active.
              </BodySmall>

              <View style={styles.confirmationActions}>
                <Button
                  label="START LISTENING"
                  variant="primary"
                  size="md"
                  onPress={() => setState('LISTENING')}
                  leftIcon={<MaterialCommunityIcons name="microphone" size={18} color={Colors.white} />}
                />
              </View>
            </View>
          )}

          {/* ── Demo Switcher Toolbar ──────────────────────────────────── */}
          <View style={styles.demoToolbar}>
            <Label style={styles.demoLabel}>SIMULATE STATE:</Label>
            <View style={styles.demoBtnRow}>
              <TouchableOpacity
                style={[styles.demoBtn, state === 'LISTENING' && styles.demoBtnActive]}
                onPress={() => setState('LISTENING')}
              >
                <BodySmall style={styles.demoBtnText}>Listening</BodySmall>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoBtn, state === 'CONFIRMATION' && styles.demoBtnActive]}
                onPress={() => handleSimulateDetection('Emergency')}
              >
                <BodySmall style={styles.demoBtnText}>Detected</BodySmall>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoBtn, state === 'UNAVAILABLE' && styles.demoBtnActive]}
                onPress={() => setState('UNAVAILABLE')}
              >
                <BodySmall style={styles.demoBtnText}>Unavailable</BodySmall>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.88)',
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
    borderColor: Colors.border.default,
    padding: Spacing.xl,
    gap: Spacing.md,
    ...Shadow.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    letterSpacing: 1,
  },
  stateContent: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  // Listening state
  listeningCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.brand,
  },
  listeningText: {
    fontSize: 22,
    letterSpacing: 0.5,
    color: Colors.text.primary,
  },
  listeningHint: {
    fontSize: 13,
    paddingHorizontal: Spacing.sm,
  },
  phrasesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  phraseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface.secondary,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
    borderColor: Colors.brand.primary,
  },
  phraseText: {
    color: Colors.brand.primaryLight,
    fontWeight: '700',
    fontSize: 12,
  },
  tapTip: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  actionRow: {
    width: '100%',
    marginTop: Spacing.xs,
  },
  // Detected state
  detectedIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 23, 68, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.danger.extreme,
  },
  detectedTitle: {
    color: Colors.danger.extreme,
    fontSize: 20,
    fontWeight: '800',
  },
  detectedPhraseCard: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  confirmationActions: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  // Unavailable state
  unavailableIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.warning.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableTitle: {
    color: Colors.warning.default,
    fontSize: 20,
  },
  // Idle state
  idleIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Demo Switcher
  demoToolbar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border.subtle,
    paddingTop: Spacing.sm,
    gap: 6,
  },
  demoLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  demoBtnActive: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.tint,
  },
  demoBtnText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
});
