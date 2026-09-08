/**
 * PrimaryButton — High-priority primary action CTA
 *
 * Designed with large touch target (56px), strong contrast,
 * and clear visual state (enabled/disabled/loading).
 */

import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Body } from './Typography';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/spacing';
import { FontFamily, FontSize, LetterSpacing } from '../../constants/typography';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  disabledLabel?: string;
  loading?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  variant?: 'primary' | 'safe' | 'danger';
  style?: ViewStyle;
  testID?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  disabledLabel,
  loading = false,
  icon,
  variant = 'primary',
  style,
  testID,
}: PrimaryButtonProps) {
  const displayLabel = disabled && disabledLabel ? disabledLabel : label;

  const getBackgroundColor = () => {
    if (disabled) return Colors.surface.secondary;
    switch (variant) {
      case 'safe':
        return Colors.safe.default;
      case 'danger':
        return Colors.danger.default;
      case 'primary':
      default:
        return Colors.brand.primary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return Colors.border.default;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        !disabled && variant === 'primary' && (Shadow.brand as ViewStyle),
        !disabled && variant === 'danger' && (Shadow.danger as ViewStyle),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.white} />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color={disabled ? Colors.text.tertiary : Colors.white}
              style={styles.icon}
            />
          ) : null}
          <Body
            style={[
              styles.label,
              {
                color: disabled ? Colors.text.tertiary : Colors.white,
              },
            ]}
          >
            {displayLabel}
          </Body>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    width: '100%',
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  disabledButton: {
    opacity: 0.85,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  icon: {
    marginRight: 2,
  },
  label: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.lg,
    letterSpacing: LetterSpacing.wider,
    textTransform: 'uppercase',
  },
});
