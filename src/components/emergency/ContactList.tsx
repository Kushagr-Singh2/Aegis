/**
 * ContactList — Trusted contacts with dialer actions
 *
 * Shows emergency contacts and allows tapping to open the dialer.
 * Uses EmergencyDialer abstraction — never auto-dials.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmergencyDialer } from '../../lib/EmergencyDialer';
import { Card } from '../ui/Card';
import { Heading3, Body, BodySmall, Label } from '../ui/Typography';
import { Divider } from '../ui/Divider';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { MOCK_TRUSTED_CONTACTS, type TrustedContact } from '../../lib/mockData';

// ── Component ────────────────────────────────────────────────────────────────

export function ContactList() {
  const emergencyContacts = MOCK_TRUSTED_CONTACTS.filter((c) => c.isEmergencyContact);
  const otherContacts = MOCK_TRUSTED_CONTACTS.filter((c) => !c.isEmergencyContact);

  function handleCallContact(contact: TrustedContact) {
    EmergencyDialer.openDialer(contact.phone, (result) => {
      console.log(`[ContactList] Dialer result for ${contact.name}:`, result);
    });
  }

  function handleCallEmergency() {
    EmergencyDialer.callEmergency((result) => {
      console.log('[ContactList] Emergency 112 dialer result:', result);
    });
  }

  return (
    <View style={styles.container}>
      {/* Emergency number */}
      <View style={styles.section}>
        <Label style={styles.sectionLabel}>Emergency Services</Label>
        <Card variant="danger" padding="md" style={styles.emergencyCard}>
          <View style={styles.emergencyRow}>
            <View style={styles.emergencyInfo}>
              <MaterialCommunityIcons name="ambulance" size={24} color={Colors.danger.default} />
              <View>
                <Body style={{ color: Colors.danger.default, fontWeight: '700' }}>
                  Emergency: 112
                </Body>
                <BodySmall color={Colors.text.secondary}>
                  Police · Fire · Medical · All emergencies
                </BodySmall>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={handleCallEmergency}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="phone" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {/* Emergency contacts */}
      <View style={styles.section}>
        <Label style={styles.sectionLabel}>Trusted Contacts</Label>
        <Card variant="default" padding="none">
          {emergencyContacts.map((contact, index) => (
            <View key={contact.id}>
              <ContactItem contact={contact} onCall={() => handleCallContact(contact)} />
              {index < emergencyContacts.length - 1 && (
                <Divider style={styles.divider} />
              )}
            </View>
          ))}
        </Card>
      </View>

      {/* Other contacts */}
      {otherContacts.length > 0 && (
        <View style={styles.section}>
          <Label style={styles.sectionLabel}>Other Contacts</Label>
          <Card variant="default" padding="none">
            {otherContacts.map((contact, index) => (
              <View key={contact.id}>
                <ContactItem contact={contact} onCall={() => handleCallContact(contact)} />
                {index < otherContacts.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <MaterialCommunityIcons
          name="information-outline"
          size={14}
          color={Colors.text.tertiary}
        />
        <BodySmall color={Colors.text.tertiary} style={styles.disclaimerText}>
          Tapping Call opens your dialer with the number pre-filled.
          You confirm the call — Aegis never dials automatically.
        </BodySmall>
      </View>

      <View style={styles.bottomSpacer} />

      {/* Suppress FlatList unused warning */}
      {false && <FlatList data={[]} renderItem={() => null} />}
    </View>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

type ContactItemProps = {
  contact: TrustedContact;
  onCall: () => void;
};

function ContactItem({ contact, onCall }: ContactItemProps) {
  return (
    <View style={styles.contactItem}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Body style={styles.avatarText}>{contact.avatarInitials}</Body>
      </View>

      {/* Info */}
      <View style={styles.contactInfo}>
        <Body numberOfLines={1}>{contact.name}</Body>
        <BodySmall color={Colors.text.secondary} numberOfLines={1}>
          {contact.relationship} · {contact.phone}
        </BodySmall>
      </View>

      {/* Emergency badge */}
      {contact.isEmergencyContact && (
        <View style={styles.emergencyBadge}>
          <MaterialCommunityIcons name="shield-check" size={12} color={Colors.brand.primary} />
        </View>
      )}

      {/* Call button */}
      <TouchableOpacity
        style={styles.contactCallButton}
        onPress={onCall}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialCommunityIcons name="phone-outline" size={20} color={Colors.safe.default} />
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
  },
  // Emergency card
  emergencyCard: {},
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emergencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.danger.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Contacts
  divider: {
    marginHorizontal: Spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand.tint,
    borderWidth: 1,
    borderColor: Colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.brand.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  contactInfo: {
    flex: 1,
  },
  emergencyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.safe.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});
