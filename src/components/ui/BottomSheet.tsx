/**
 * BottomSheet — Reusable bottom sheet component
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

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  style?: ViewStyle;
  maxHeight?: number | string;
};

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  style,
  maxHeight = '85%',
}: BottomSheetProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.sheet, { maxHeight: maxHeight as any }, Shadow.lg as ViewStyle, style]}>
              <View style={styles.handleBar}>
                <View style={styles.handle} />
              </View>
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
              <View style={styles.content}>{children}</View>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    backgroundColor: Colors.surface.primary,
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border.default,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  subtitle: {
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flexShrink: 1,
  },
});
