/**
 * Onboarding Screen (Placeholder)
 *
 * Welcomes user to Aegis and introduces Journey Protection concept.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '../src/components/ui/SafeScreen';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import {
  DisplayLarge,
  Heading2,
  Body,
  BodySecondary,
  Label,
} from '../src/components/ui/Typography';
import { Colors } from '../src/constants/colors';
import { Spacing } from '../src/constants/spacing';
import { useAppStore } from '../src/store/useAppStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const handleGetStarted = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeScreen padded style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={48}
              color={Colors.brand.primary}
            />
          </View>
          <DisplayLarge style={styles.title}>AEGIS</DisplayLarge>
          <BodySecondary align="center" style={styles.subtitle}>
            Journey-based AI protection. Safety activates when you begin moving.
          </BodySecondary>
        </View>

        <View style={styles.featureList}>
          <Card variant="default" style={styles.featureCard}>
            <View style={styles.featureRow}>
              <MaterialCommunityIcons
                name="navigation-variant-outline"
                size={24}
                color={Colors.brand.primary}
              />
              <View style={styles.featureText}>
                <Heading2 style={styles.featureTitle}>Journey Protection</Heading2>
                <BodySecondary>
                  No 24/7 background tracking. Monitoring activates exclusively for your active journey.
                </BodySecondary>
              </View>
            </View>
          </Card>

          <Card variant="default" style={styles.featureCard}>
            <View style={styles.featureRow}>
              <MaterialCommunityIcons
                name="alert-octagon-outline"
                size={24}
                color={Colors.danger.default}
              />
              <View style={styles.featureText}>
                <Heading2 style={styles.featureTitle}>Instant Assistance</Heading2>
                <BodySecondary>
                  Quick dialer launch for 112 emergency and immediate trusted contact coordination.
                </BodySecondary>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button
            label="Get Started"
            variant="primary"
            size="lg"
            onPress={handleGetStarted}
          />
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
    marginBottom: Spacing.md,
  },
  title: {
    letterSpacing: 4,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    paddingHorizontal: Spacing.md,
  },
  featureList: {
    gap: Spacing.md,
  },
  featureCard: {
    padding: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  footer: {
    marginBottom: Spacing.md,
  },
});
