/**
 * Modal — Reusable dialog modal component
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  type ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading2, BodySecondary } from './Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Shadow } from '../../constants/spacing';

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  style?: ViewStyle;
};

export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  style,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.dialog, Shadow.lg as ViewStyle, style]}>
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  <View style={styles.titleContainer}>
                    {title ? <Heading2>{title}</Heading2> : null}
                    {subtitle ? (
                      <BodySecondary style={styles.subtitle}>{subtitle}</BodySecondary>
                    ) : null}
                  </View>
                  {showCloseButton ? (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={onClose}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={22}
                        color={Colors.text.secondary}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
              <View style={styles.body}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 9, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border.default,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  subtitle: {
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  body: {},
});
