/**
 * Journey Screen
 *
 * Displays either:
 * - JourneySetup: When status is 'idle' (choose destination and start)
 * - JourneyStatus: When status is 'active' or 'sos' (monitoring panel)
 * - Arrival Summary: When status is 'arrived' (safe arrival confirmation)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { Heading1, Body, BodySecondary, Label } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { JourneySetup } from '../../src/components/journey/JourneySetup';
import { JourneyStatus } from '../../src/components/journey/JourneyStatus';
import { useJourneyStore } from '../../src/store/useJourneyStore';
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/spacing';

export default function JourneyScreen() {
  const status = useJourneyStore((s) => s.status);
  const destination = useJourneyStore((s) => s.destination);
  const resetJourney = useJourneyStore((s) => s.resetJourney);

  return (
    <SafeScreen style={styles.container}>
      <View style={styles.header}>
        <Label style={styles.headerLabel}>JOURNEY PROTECTION</Label>
        <Heading1>
          {status === 'idle'
            ? 'Plan Journey'
            : status === 'arrived'
            ? 'Safe Arrival'
            : 'Active Journey'}
        </Heading1>
      </View>

      {status === 'idle' && <JourneySetup />}

      {(status === 'active' || status === 'sos') && <JourneyStatus />}

      {status === 'arrived' && (
        <View style={styles.arrivedContainer}>
          <Card variant="safe" padding="lg" style={styles.arrivedCard}>
            <View style={styles.arrivedIcon}>
              <MaterialCommunityIcons
                name="shield-check"
                size={54}
                color={Colors.safe.default}
              />
            </View>
            <Heading1 style={styles.arrivedTitle} align="center">
              Destination Reached
            </Heading1>
            <BodySecondary align="center" style={styles.arrivedSubtitle}>
              You have safely arrived at{' '}
              <Body style={styles.boldText}>{destination?.name ?? 'your destination'}</Body>.
              Journey protection has concluded.
            </BodySecondary>
          </Card>

          <View style={styles.doneAction}>
            <Button
              label="Complete & Return Home"
              variant="primary"
              size="lg"
              onPress={resetJourney}
            />
          </View>
        </View>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLabel: {
    marginBottom: 2,
  },
  arrivedContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xl,
  },
  arrivedCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  arrivedIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.safe.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  arrivedTitle: {
    marginBottom: Spacing.xs,
  },
  arrivedSubtitle: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.text.primary,
  },
  doneAction: {
    paddingHorizontal: Spacing.md,
  },
});
