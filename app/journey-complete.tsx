/**
 * Journey Complete Screen (Phase 2)
 *
 * Shown after the user taps "END JOURNEY" or arrives at destination.
 *
 * Displays:
 * - Shield checkmark hero animation (static for Phase 2)
 * - ✓ JOURNEY COMPLETED heading
 * - "You've arrived safely. Journey protection has ended."
 * - Journey summary stats (duration, distance, safety level)
 * - [ Return Home ] button
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading1, Heading3, Body, BodySecondary, Label } from '../src/components/ui/Typography';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { Card } from '../src/components/ui/Card';
import { Divider } from '../src/components/ui/Divider';
import { Colors } from '../src/constants/colors';
import { BorderRadius, Shadow, Spacing } from '../src/constants/spacing';
import { useJourneyStore } from '../src/store/useJourneyStore';
import { selectJourneyDuration } from '../src/store/useJourneyStore';

export default function JourneyCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const destination = useJourneyStore((s) => s.destination);
  const selectedRoute = useJourneyStore((s) => s.selectedRoute);
  const resetJourney = useJourneyStore((s) => s.resetJourney);
  const startedAt = useJourneyStore((s) => s.startedAt);

  // Compute duration snapshot before reset
  const durationLabel = startedAt ? selectJourneyDuration({ startedAt } as any) : '—';

  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleReturnHome = () => {
    resetJourney();
    router.replace('/(tabs)');
  };

  const distance = selectedRoute?.distance ?? '8.2 km';
  const routeLabel = selectedRoute?.label ?? 'Route B';
  const destName = destination?.name ?? 'your destination';

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      {/* Hero */}
      <Animated.View
        style={[
          styles.heroContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.shieldCircle}>
          <MaterialCommunityIcons
            name="shield-check"
            size={72}
            color={Colors.safe.default}
          />
        </View>
        <Label style={styles.checkLabel}>✓ JOURNEY COMPLETED</Label>
        <Heading1 align="center" style={styles.heroTitle}>
          You've arrived safely.
        </Heading1>
        <BodySecondary align="center" style={styles.heroSubtitle}>
          Journey protection has ended.{'\n'}
          You reached <Body style={styles.destHighlight}>{destName}</Body>.
        </BodySecondary>
      </Animated.View>

      {/* Journey summary card */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Card variant="safe" padding="md" style={styles.summaryCard}>
          <Label style={styles.summaryTitle}>JOURNEY SUMMARY</Label>
          <Divider marginVertical={10} />
          <View style={styles.statsGrid}>
            <StatItem icon="clock-check-outline" label="Duration" value={durationLabel} />
            <StatItem icon="map-marker-distance" label="Distance" value={distance} />
            <StatItem icon="map-legend" label="Route" value={routeLabel} />
            <StatItem icon="shield-half-full" label="Safety" value="Low Risk" color={Colors.safe.default} />
          </View>
        </Card>
      </Animated.View>

      <View style={styles.spacer} />

      {/* CTA */}
      <Animated.View style={[styles.cta, { opacity: fadeAnim }]}>
        <PrimaryButton
          label="Return Home"
          icon="home-outline"
          onPress={handleReturnHome}
        />
        <BodySecondary align="center" style={styles.ctaNote}>
          Your journey data has been saved.
        </BodySecondary>
      </Animated.View>
    </View>
  );
}

function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={statStyles.item}>
      <MaterialCommunityIcons name={icon as any} size={18} color={Colors.text.secondary} />
      <Label style={statStyles.label}>{label}</Label>
      <Body style={[statStyles.value, color ? { color } : {}]}>{value}</Body>
    </View>
  );
}

const statStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
  },
  value: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 13,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.md,
    paddingTop: 0,
    alignItems: 'stretch',
  },
  heroContainer: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    gap: Spacing.md,
  },
  shieldCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: Colors.safe.tint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.safe.default,
    ...Shadow.brand,
  },
  checkLabel: {
    color: Colors.safe.default,
    letterSpacing: 2,
    fontSize: 12,
    marginTop: Spacing.sm,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  heroSubtitle: {
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  destHighlight: {
    color: Colors.text.primary,
    fontWeight: '700',
  },
  summaryCard: {
    marginTop: Spacing.xl,
  },
  summaryTitle: {
    letterSpacing: 1,
    color: Colors.safe.default,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    gap: Spacing.sm,
  },
  ctaNote: {
    fontSize: 12,
  },
});
