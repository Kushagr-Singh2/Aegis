/**
 * Button — Reusable AEGIS button component
 *
 * Variants: primary | secondary | danger | ghost | outline
 * Sizes: sm | md | lg
 *
 * Large touch targets (min 48px) for accessibility.
 */

import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  View,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, LetterSpacing } from '../../constants/typography';
import { BorderRadius, Shadow } from '../../constants/spacing';
import { Body } from './Typography';

// ── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = TouchableOpacityProps & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
};

// ── Component ────────────────────────────────────────────────────────────────

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth ? styles.fullWidth : styles.inline,
    isDisabled ? styles.disabled : undefined,
    ...(variant === 'primary' ? [Shadow.brand as ViewStyle] : []),
    ...(variant === 'danger' ? [Shadow.danger as ViewStyle] : []),
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' || variant === 'outline' ? Colors.brand.primary : Colors.white}
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <Body
            style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}
            numberOfLines={1}
          >
            {label}
          </Body>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  inline: {
    alignSelf: 'flex-start',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },

  // Sizes
  size_sm: {
    height: 40,
    paddingHorizontal: 16,
  },
  size_md: {
    height: 52,
    paddingHorizontal: 24,
  },
  size_lg: {
    height: 60,
    paddingHorizontal: 32,
  },

  // Variants
  variant_primary: {
    backgroundColor: Colors.brand.primary,
  },
  variant_secondary: {
    backgroundColor: Colors.surface.secondary,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  variant_danger: {
    backgroundColor: Colors.danger.default,
  },
  variant_ghost: {
    backgroundColor: Colors.transparent,
  },
  variant_outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1,
    borderColor: Colors.brand.primary,
  },

  // Disabled
  disabled: {
    opacity: 0.45,
  },

  // Labels
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    letterSpacing: LetterSpacing.wide,
    color: Colors.white,
  } as TextStyle,

  label_primary: { color: Colors.white } as TextStyle,
  label_secondary: { color: Colors.text.primary } as TextStyle,
  label_danger: { color: Colors.white } as TextStyle,
  label_ghost: { color: Colors.brand.primary } as TextStyle,
  label_outline: { color: Colors.brand.primary } as TextStyle,

  labelSize_sm: { fontSize: FontSize.sm } as TextStyle,
  labelSize_md: { fontSize: FontSize.md } as TextStyle,
  labelSize_lg: { fontSize: FontSize.lg } as TextStyle,
});
