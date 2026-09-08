/**
 * Emergency Screen
 *
 * Provides instant access to:
 * - High-visibility SOS Button (Hold to activate)
 * - Emergency 112 dialer launcher
 * - Trusted contact calling list
 *
 * Complies with Android Intent.ACTION_DIAL requirement (never auto-dials).
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import { Heading1, Label } from '../../src/components/ui/Typography';
import { SOSButton } from '../../src/components/emergency/SOSButton';
import { ContactList } from '../../src/components/emergency/ContactList';
import { Spacing } from '../../src/constants/spacing';
import { useJourneyStore } from '../../src/store/useJourneyStore';

export default function EmergencyScreen() {
  const status = useJourneyStore((s) => s.status);
  const isSOSActive = status === 'sos';

  return (
    <SafeScreen
      variant={isSOSActive ? 'emergency' : 'default'}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Label style={styles.headerLabel}>CRITICAL RESPONSE</Label>
          <Heading1>{isSOSActive ? 'Emergency Alert Active' : 'Emergency'}</Heading1>
        </View>

        {/* SOS Button Section */}
        <View style={styles.sosSection}>
          <SOSButton />
        </View>

        {/* Contacts & 112 Services */}
        <ContactList />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerLabel: {
    marginBottom: 2,
  },
  sosSection: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
