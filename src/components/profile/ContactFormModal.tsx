/**
 * ContactFormModal — Add or Edit a Trusted Contact
 *
 * Supports:
 * - Name input
 * - Relationship (Parent, Partner, Friend, Sibling, Colleague, Other)
 * - Phone number
 * - Emergency Contact checkbox toggle
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading2, Heading3, Body, BodySmall, Label } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/spacing';
import type { TrustedContact } from '../../lib/mockData';

type Props = {
  visible: boolean;
  contactToEdit?: TrustedContact | null;
  onSave: (contact: {
    name: string;
    relationship: string;
    phone: string;
    isEmergencyContact: boolean;
  }) => void;
  onClose: () => void;
};

const RELATIONSHIPS = ['Parent', 'Partner', 'Friend', 'Sibling', 'Colleague', 'Guardian', 'Other'];

export function ContactFormModal({
  visible,
  contactToEdit,
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [phone, setPhone] = useState('');
  const [isEmergencyContact, setIsEmergencyContact] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contactToEdit) {
      setName(contactToEdit.name);
      setRelationship(contactToEdit.relationship);
      setPhone(contactToEdit.phone);
      setIsEmergencyContact(contactToEdit.isEmergencyContact ?? false);
    } else {
      setName('');
      setRelationship('Parent');
      setPhone('+91 ');
      setIsEmergencyContact(true);
    }
    setError(null);
  }, [contactToEdit, visible]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Please enter contact name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please enter a valid phone number.');
      return;
    }

    onSave({
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      isEmergencyContact,
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons
                name={contactToEdit ? 'account-edit' : 'account-plus'}
                size={22}
                color={Colors.brand.primary}
              />
              <Heading3 style={styles.title}>
                {contactToEdit ? 'EDIT CONTACT' : 'ADD TRUSTED CONTACT'}
              </Heading3>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {error && (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.danger.default} />
                <BodySmall style={{ color: Colors.danger.default }}>{error}</BodySmall>
              </View>
            )}

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Label style={styles.inputLabel}>FULL NAME</Label>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Aarav Sharma"
                placeholderTextColor={Colors.text.tertiary}
                value={name}
                onChangeText={setName}
                autoFocus={!contactToEdit}
              />
            </View>

            {/* Relationship Chips */}
            <View style={styles.inputGroup}>
              <Label style={styles.inputLabel}>RELATIONSHIP</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                <View style={styles.chipRow}>
                  {RELATIONSHIPS.map((rel) => {
                    const isSelected = relationship === rel;
                    return (
                      <TouchableOpacity
                        key={rel}
                        style={[styles.relChip, isSelected && styles.relChipSelected]}
                        onPress={() => setRelationship(rel)}
                      >
                        <BodySmall style={[styles.relChipText, isSelected && styles.relChipTextSelected]}>
                          {rel}
                        </BodySmall>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Label style={styles.inputLabel}>PHONE NUMBER</Label>
              <TextInput
                style={styles.textInput}
                placeholder="+91 98765 43210"
                placeholderTextColor={Colors.text.tertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <BodySmall color={Colors.text.tertiary} style={styles.inputHint}>
                Calls will open your Android dialer with this number pre-filled.
              </BodySmall>
            </View>

            {/* Primary Emergency Contact Switch */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsEmergencyContact((v) => !v)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={isEmergencyContact ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={isEmergencyContact ? Colors.brand.primary : Colors.text.tertiary}
              />
              <View style={styles.checkboxTextCol}>
                <Body style={styles.checkboxTitle}>Primary Emergency Contact</Body>
                <BodySmall color={Colors.text.secondary}>
                  Notified first during SOS and priority check-in escalations.
                </BodySmall>
              </View>
            </TouchableOpacity>

            {/* Action buttons */}
            <View style={styles.buttonRow}>
              <Button
                label={contactToEdit ? 'SAVE CHANGES' : 'ADD TO TRUSTED CIRCLE'}
                variant="primary"
                size="lg"
                onPress={handleSubmit}
              />
              <Button
                label="CANCEL"
                variant="secondary"
                size="md"
                onPress={onClose}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.88)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background.elevated,
    borderTopLeftRadius: BorderRadius.modal,
    borderTopRightRadius: BorderRadius.modal,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderColor: Colors.border.default,
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
    gap: 8,
  },
  title: {
    letterSpacing: 1,
    color: Colors.brand.primaryLight,
  },
  form: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.danger.tint,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: Colors.text.tertiary,
    fontSize: 10,
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.text.primary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  inputHint: {
    fontSize: 11,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  relChip: {
    backgroundColor: Colors.surface.secondary,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  relChipSelected: {
    backgroundColor: Colors.brand.tint,
    borderColor: Colors.brand.primary,
  },
  relChipText: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  relChipTextSelected: {
    color: Colors.brand.primary,
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surface.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border.default,
  },
  checkboxTextCol: {
    flex: 1,
    gap: 2,
  },
  checkboxTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  buttonRow: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
