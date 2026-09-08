/**
 * Profile Screen (Placeholder / Settings)
 *
 * Displays:
 * - User safety credentials & Safe Word
 * - Trusted Contacts overview
 * - Journey safety configurations
 * - Hardware / Android integration status
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import {
  Heading1,
  Heading3,
  Body,
  BodySmall,
  BodySecondary,
  Label,
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Divider } from '../../src/components/ui/Divider';
import { Colors } from '../../src/constants/colors';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { MOCK_TRUSTED_CONTACTS } from '../../src/lib/mockData';

export default function ProfileScreen() {
  const user = useAppStore((s) => s.user);

  return (
    <SafeScreen style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Label style={styles.headerLabel}>ACCOUNT & SETTINGS</Label>
          <Heading1>Safety Profile</Heading1>
        </View>

        {/* User Card */}
        {user && (
          <Card variant="default" padding="md">
            <View style={styles.userRow}>
              <View style={styles.avatarCircle}>
                <Body style={styles.avatarText}>{user.avatarInitials}</Body>
              </View>
              <View style={styles.userInfo}>
                <Heading3>{user.name}</Heading3>
                <BodySmall color={Colors.text.secondary}>{user.phone}</BodySmall>
                <BodySmall color={Colors.text.tertiary}>{user.email}</BodySmall>
              </View>
            </View>

            <Divider marginVertical={14} />

            <View style={styles.safeWordContainer}>
              <View>
                <Label>Secret Safe Word</Label>
                <Body style={styles.safeWordText}>•••••• ({user.safeWord})</Body>
              </View>
              <MaterialCommunityIcons
                name="shield-key-outline"
                size={22}
                color={Colors.brand.primary}
              />
            </View>
          </Card>
        )}

        {/* Trusted Contacts Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Label>Trusted Circle ({MOCK_TRUSTED_CONTACTS.length})</Label>
          </View>
          <Card variant="default" padding="none">
            {MOCK_TRUSTED_CONTACTS.slice(0, 2).map((contact, idx) => (
              <View key={contact.id}>
                <View style={styles.contactItem}>
                  <View style={styles.smallAvatar}>
                    <BodySmall style={styles.avatarText}>{contact.avatarInitials}</BodySmall>
                  </View>
                  <View style={styles.contactText}>
                    <Body>{contact.name}</Body>
                    <BodySmall color={Colors.text.secondary}>
                      {contact.relationship}
                    </BodySmall>
                  </View>
                  {contact.isEmergencyContact && (
                    <Label style={styles.emergencyTag}>Primary</Label>
                  )}
                </View>
                {idx === 0 && <Divider />}
              </View>
            ))}
          </Card>
        </View>

        {/* Journey Safety Preferences */}
        <View style={styles.section}>
          <Label style={styles.sectionLabel}>Journey Monitoring Signals</Label>
          <Card variant="default" padding="none">
            <SettingRow
              icon="map-marker-distance"
              title="Route Deviation Sensitivity"
              subtitle="High — Alert if 200m off expected track"
            />
            <Divider />
            <SettingRow
              icon="battery-alert-variant-outline"
              title="Low Battery Pre-Alert"
              subtitle="Notifies contacts if phone battery < 15%"
            />
            <Divider />
            <SettingRow
              icon="timer-alert-outline"
              title="Inactive Stop Detection"
              subtitle="Alerts if motionless longer than 3 minutes"
            />
          </Card>
        </View>

        {/* System & Architecture Info */}
        <View style={styles.section}>
          <Label style={styles.sectionLabel}>System & Architecture</Label>
          <Card variant="default" padding="md">
            <View style={styles.systemInfoRow}>
              <Label>Platform Target</Label>
              <BodySmall color={Colors.brand.primary}>Android Studio / Native</BodySmall>
            </View>
            <Divider marginVertical={10} />
            <View style={styles.systemInfoRow}>
              <Label>Dialer Protocol</Label>
              <BodySmall color={Colors.safe.default}>Intent.ACTION_DIAL (Manual Confirm)</BodySmall>
            </View>
            <Divider marginVertical={10} />
            <View style={styles.systemInfoRow}>
              <Label>Frontend Phase</Label>
              <BodySmall color={Colors.text.secondary}>Phase 1 UI / Architecture</BodySmall>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.settingRow}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={Colors.brand.primary}
        style={styles.settingIcon}
      />
      <View style={styles.settingText}>
        <Body>{title}</Body>
        <BodySmall color={Colors.text.secondary}>{subtitle}</BodySmall>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={Colors.text.tertiary}
      />
    </View>
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand.tint,
    borderWidth: 1,
    borderColor: Colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.brand.primary,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  safeWordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  safeWordText: {
    color: Colors.text.primary,
    letterSpacing: 1,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
  },
  emergencyTag: {
    color: Colors.brand.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  settingIcon: {
    marginRight: 4,
  },
  settingText: {
    flex: 1,
  },
  systemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
