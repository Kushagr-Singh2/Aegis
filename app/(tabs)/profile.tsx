/**
 * Safety Profile & Settings Screen (Phase 4)
 *
 * Full-featured mobile safety profile:
 * 1. Personal Information (Name, Phone, Email, Secret Safe Word)
 * 2. Trusted Contacts:
 *    - Name, Relationship, Phone
 *    - Add, Edit, Delete CRUD operations
 *    - Calling contact uses EmergencyDialer.openDialer(phoneNumber) — Never ACTION_CALL
 * 3. Emergency Preferences (Countdown seconds, auto-share location, haptics)
 * 4. Journey Settings (Check-in interval, deviation sensitivity)
 * 5. About Aegis (Version, Android Intent.ACTION_DIAL compliance policy)
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '../../src/components/ui/SafeScreen';
import {
  Heading1,
  Heading2,
  Heading3,
  Body,
  BodySmall,
  BodySecondary,
  Label,
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Divider } from '../../src/components/ui/Divider';
import { Colors } from '../../src/constants/colors';
import { Spacing, BorderRadius } from '../../src/constants/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { EmergencyDialer } from '../../src/lib/EmergencyDialer';
import { ContactFormModal } from '../../src/components/profile/ContactFormModal';
import type { TrustedContact } from '../../src/lib/mockData';

export default function ProfileScreen() {
  const user = useAppStore((s) => s.user);
  const trustedContacts = useAppStore((s) => s.trustedContacts);
  const addContact = useAppStore((s) => s.addContact);
  const updateContact = useAppStore((s) => s.updateContact);
  const deleteContact = useAppStore((s) => s.deleteContact);

  const emergencyPreferences = useAppStore((s) => s.emergencyPreferences);
  const updateEmergencyPreferences = useAppStore((s) => s.updateEmergencyPreferences);

  const journeySettings = useAppStore((s) => s.journeySettings);
  const updateJourneySettings = useAppStore((s) => s.updateJourneySettings);

  // Modal state
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<TrustedContact | null>(null);

  const handleOpenAddContact = () => {
    setContactToEdit(null);
    setIsContactModalVisible(true);
  };

  const handleOpenEditContact = (contact: TrustedContact) => {
    setContactToEdit(contact);
    setIsContactModalVisible(true);
  };

  const handleDeleteContact = (contact: TrustedContact) => {
    Alert.alert(
      'Remove Contact?',
      `Are you sure you want to remove ${contact.name} from your trusted circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteContact(contact.id),
        },
      ]
    );
  };

  const handleCallContact = (contact: TrustedContact) => {
    // Strictly uses EmergencyDialer.openDialer — Never ACTION_CALL
    EmergencyDialer.openDialer(contact.phone);
  };

  const handleSaveContact = (data: {
    name: string;
    relationship: string;
    phone: string;
    isEmergencyContact: boolean;
  }) => {
    if (contactToEdit) {
      updateContact(contactToEdit.id, data);
    } else {
      addContact(data);
    }
  };

  return (
    <SafeScreen style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Label style={styles.headerLabel}>ACCOUNT & SAFETY PROFILE</Label>
          <Heading1>Profile</Heading1>
        </View>

        {/* ── 1. Personal Information ──────────────────────────────────── */}
        {user && (
          <Card variant="default" padding="md" style={styles.userCard}>
            <View style={styles.userRow}>
              <View style={styles.avatarCircle}>
                <Heading3 style={styles.avatarText}>{user.avatarInitials}</Heading3>
              </View>
              <View style={styles.userInfo}>
                <Heading2 style={styles.userName}>{user.name}</Heading2>
                <BodySmall color={Colors.text.secondary}>{user.phone}</BodySmall>
                <BodySmall color={Colors.text.tertiary}>{user.email}</BodySmall>
              </View>
            </View>

            <Divider marginVertical={12} />

            {/* Secret Safe Word */}
            <View style={styles.safeWordContainer}>
              <View>
                <Label style={styles.safeWordLabel}>SECRET SAFE WORD</Label>
                <Body style={styles.safeWordValue}>•••••• ({user.safeWord})</Body>
              </View>
              <View style={styles.safeWordIconBox}>
                <MaterialCommunityIcons
                  name="shield-key"
                  size={20}
                  color={Colors.brand.primary}
                />
              </View>
            </View>
          </Card>
        )}

        {/* ── 2. Trusted Contacts ──────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="account-group" size={18} color={Colors.brand.primary} />
              <Label style={styles.sectionTitle}>
                TRUSTED CONTACTS ({trustedContacts.length})
              </Label>
            </View>
            <TouchableOpacity
              style={styles.addContactBtn}
              onPress={handleOpenAddContact}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="plus" size={16} color={Colors.brand.primary} />
              <BodySmall style={styles.addContactText}>Add Contact</BodySmall>
            </TouchableOpacity>
          </View>

          <Card variant="default" padding="none" style={styles.contactsCard}>
            {trustedContacts.map((contact, idx) => (
              <View key={contact.id}>
                <View style={styles.contactRow}>
                  {/* Avatar */}
                  <View style={styles.smallAvatar}>
                    <BodySmall style={styles.contactAvatarText}>
                      {contact.avatarInitials}
                    </BodySmall>
                  </View>

                  {/* Name, Relationship, Phone */}
                  <View style={styles.contactDetails}>
                    <View style={styles.contactNameRow}>
                      <Body style={styles.contactName}>{contact.name}</Body>
                      {contact.isEmergencyContact && (
                        <View style={styles.primaryTag}>
                          <BodySmall style={styles.primaryTagText}>Primary</BodySmall>
                        </View>
                      )}
                    </View>
                    <BodySmall color={Colors.text.secondary}>
                      {contact.relationship} · {contact.phone}
                    </BodySmall>
                  </View>

                  {/* Action Icons: Call, Edit, Delete */}
                  <View style={styles.contactActions}>
                    {/* Call (Never ACTION_CALL) */}
                    <TouchableOpacity
                      style={[styles.actionIconBtn, styles.callIconBtn]}
                      onPress={() => handleCallContact(contact)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <MaterialCommunityIcons name="phone" size={16} color={Colors.white} />
                    </TouchableOpacity>

                    {/* Edit */}
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleOpenEditContact(contact)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <MaterialCommunityIcons name="pencil" size={16} color={Colors.text.secondary} />
                    </TouchableOpacity>

                    {/* Delete */}
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleDeleteContact(contact)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.danger.default} />
                    </TouchableOpacity>
                  </View>
                </View>

                {idx < trustedContacts.length - 1 && <Divider />}
              </View>
            ))}
          </Card>
        </View>

        {/* ── 3. Emergency Preferences ─────────────────────────────────── */}
        <View style={styles.section}>
          <Label style={styles.sectionTitle}>EMERGENCY PREFERENCES</Label>
          <Card variant="default" padding="none" style={styles.settingsCard}>
            {/* Countdown seconds selector */}
            <View style={styles.settingItem}>
              <View style={styles.settingTextCol}>
                <Body>SOS Confirmation Countdown</Body>
                <BodySmall color={Colors.text.secondary}>
                  Abortable grace period before SOS broadcasts
                </BodySmall>
              </View>
              <View style={styles.toggleGroup}>
                {[3, 5, 10].map((sec) => (
                  <TouchableOpacity
                    key={sec}
                    style={[
                      styles.toggleOption,
                      emergencyPreferences.countdownSeconds === sec && styles.toggleOptionActive,
                    ]}
                    onPress={() => updateEmergencyPreferences({ countdownSeconds: sec })}
                  >
                    <BodySmall
                      style={[
                        styles.toggleOptionText,
                        emergencyPreferences.countdownSeconds === sec && styles.toggleOptionTextActive,
                      ]}
                    >
                      {sec}s
                    </BodySmall>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Divider />

            {/* Auto Share Location */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                updateEmergencyPreferences({
                  autoShareLocation: !emergencyPreferences.autoShareLocation,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.settingTextCol}>
                <Body>Live GPS Broadcast</Body>
                <BodySmall color={Colors.text.secondary}>
                  Includes encrypted real-time coordinate URL in SOS alert
                </BodySmall>
              </View>
              <MaterialCommunityIcons
                name={emergencyPreferences.autoShareLocation ? 'toggle-switch' : 'toggle-switch-off'}
                size={32}
                color={emergencyPreferences.autoShareLocation ? Colors.brand.primary : Colors.text.tertiary}
              />
            </TouchableOpacity>

            <Divider />

            {/* Haptic Feedback */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() =>
                updateEmergencyPreferences({
                  hapticFeedback: !emergencyPreferences.hapticFeedback,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.settingTextCol}>
                <Body>Vibration & Haptic Alarm</Body>
                <BodySmall color={Colors.text.secondary}>
                  High-frequency pulses during countdown and check-in
                </BodySmall>
              </View>
              <MaterialCommunityIcons
                name={emergencyPreferences.hapticFeedback ? 'toggle-switch' : 'toggle-switch-off'}
                size={32}
                color={emergencyPreferences.hapticFeedback ? Colors.brand.primary : Colors.text.tertiary}
              />
            </TouchableOpacity>
          </Card>
        </View>

        {/* ── 4. Journey Settings ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Label style={styles.sectionTitle}>JOURNEY SETTINGS</Label>
          <Card variant="default" padding="none" style={styles.settingsCard}>
            {/* Check-in Interval */}
            <View style={styles.settingItem}>
              <View style={styles.settingTextCol}>
                <Body>Safety Check-In Frequency</Body>
                <BodySmall color={Colors.text.secondary}>
                  Interval for periodic "Are you safe?" prompts
                </BodySmall>
              </View>
              <View style={styles.toggleGroup}>
                {[15, 30, 45].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.toggleOption,
                      journeySettings.checkInIntervalMinutes === mins && styles.toggleOptionActive,
                    ]}
                    onPress={() => updateJourneySettings({ checkInIntervalMinutes: mins })}
                  >
                    <BodySmall
                      style={[
                        styles.toggleOptionText,
                        journeySettings.checkInIntervalMinutes === mins && styles.toggleOptionTextActive,
                      ]}
                    >
                      {mins}m
                    </BodySmall>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Divider />

            {/* Deviation Sensitivity */}
            <View style={styles.settingItem}>
              <View style={styles.settingTextCol}>
                <Body>Route Deviation Sensitivity</Body>
                <BodySmall color={Colors.text.secondary}>
                  Alert threshold for unexpected corridor departures
                </BodySmall>
              </View>
              <View style={styles.toggleGroup}>
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.toggleOption,
                      journeySettings.deviationSensitivity === lvl && styles.toggleOptionActive,
                    ]}
                    onPress={() => updateJourneySettings({ deviationSensitivity: lvl })}
                  >
                    <BodySmall
                      style={[
                        styles.toggleOptionText,
                        journeySettings.deviationSensitivity === lvl && styles.toggleOptionTextActive,
                      ]}
                    >
                      {lvl}
                    </BodySmall>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* ── 5. About Aegis ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Label style={styles.sectionTitle}>ABOUT AEGIS</Label>
          <Card variant="default" padding="md" style={styles.aboutCard}>
            <View style={styles.aboutRow}>
              <Label>App Version</Label>
              <BodySmall color={Colors.brand.primaryLight}>AEGIS v2.4.0 (Phase 4 Mobile)</BodySmall>
            </View>

            <Divider marginVertical={10} />

            <View style={styles.complianceBox}>
              <View style={styles.complianceHeader}>
                <MaterialCommunityIcons name="shield-check" size={18} color={Colors.safe.default} />
                <Label style={styles.complianceTitle}>ANDROID CALLING COMPLIANCE</Label>
              </View>
              <BodySmall color={Colors.text.secondary} style={styles.complianceText}>
                Aegis strictly uses Intent.ACTION_DIAL with tel:112 and contacts. It never uses Intent.ACTION_CALL and never requests the dangerous CALL_PHONE permission. All outgoing calls require explicit user manual confirmation on the dialer.
              </BodySmall>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Add / Edit Contact Modal */}
      <ContactFormModal
        visible={isContactModalVisible}
        contactToEdit={contactToEdit}
        onSave={handleSaveContact}
        onClose={() => setIsContactModalVisible(false)}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerLabel: {
    marginBottom: 2,
  },
  userCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface.primary,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.brand.tint,
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.brand.primary,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 20,
  },
  safeWordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  safeWordLabel: {
    fontSize: 10,
    letterSpacing: 1,
  },
  safeWordValue: {
    fontSize: 14,
    color: Colors.brand.primaryLight,
    fontWeight: '700',
    marginTop: 2,
  },
  safeWordIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    letterSpacing: 1,
    color: Colors.text.tertiary,
    fontSize: 11,
  },
  addContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.brand.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.badge,
  },
  addContactText: {
    color: Colors.brand.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  contactsCard: {
    backgroundColor: Colors.surface.primary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  smallAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  contactAvatarText: {
    color: Colors.text.primary,
    fontWeight: '700',
  },
  contactDetails: {
    flex: 1,
    gap: 2,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactName: {
    fontWeight: '700',
  },
  primaryTag: {
    backgroundColor: Colors.brand.tint,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.badge,
  },
  primaryTagText: {
    color: Colors.brand.primary,
    fontSize: 9,
    fontWeight: '800',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIconBtn: {
    backgroundColor: Colors.safe.default,
  },
  settingsCard: {
    backgroundColor: Colors.surface.primary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  settingTextCol: {
    flex: 1,
    gap: 2,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  toggleOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  toggleOptionActive: {
    backgroundColor: Colors.brand.primary,
  },
  toggleOptionText: {
    color: Colors.text.tertiary,
    fontSize: 11,
    fontWeight: '700',
  },
  toggleOptionTextActive: {
    color: Colors.white,
  },
  aboutCard: {
    backgroundColor: Colors.surface.primary,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complianceBox: {
    backgroundColor: Colors.surface.secondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.card,
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.safe.default,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  complianceTitle: {
    color: Colors.safe.default,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  complianceText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
