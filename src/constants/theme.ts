/**
 * AEGIS Theme
 *
 * Composed theme object — single import for all design tokens.
 * Import { Theme } from '@constants/theme' in components.
 */

import { Colors } from './colors';
import { FontFamily, FontSize, Typography, LetterSpacing, LineHeight } from './typography';
import { Spacing, BorderRadius, Shadow } from './spacing';

export const Theme = {
  colors: Colors,
  typography: Typography,
  fontFamily: FontFamily,
  fontSize: FontSize,
  lineHeight: LineHeight,
  letterSpacing: LetterSpacing,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadow: Shadow,

  // Component-specific tokens
  components: {
    tabBar: {
      height: 72,
      backgroundColor: Colors.background.elevated,
      borderTopColor: Colors.border.default,
      activeTintColor: Colors.brand.primary,
      inactiveTintColor: Colors.text.tertiary,
    },
    header: {
      height: 60,
      backgroundColor: Colors.background.primary,
      borderBottomColor: Colors.border.subtle,
    },
    card: {
      backgroundColor: Colors.surface.primary,
      borderRadius: BorderRadius.card,
      padding: Spacing.md,
      borderColor: Colors.border.subtle,
      borderWidth: 1,
    },
    input: {
      backgroundColor: Colors.surface.secondary,
      borderRadius: BorderRadius.input,
      borderColor: Colors.border.default,
      borderWidth: 1,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      color: Colors.text.primary,
      fontSize: FontSize.md,
      fontFamily: FontFamily.bodyRegular,
    },
    button: {
      primary: {
        backgroundColor: Colors.brand.primary,
        borderRadius: BorderRadius.button,
        height: 56,
        paddingHorizontal: Spacing.lg,
      },
      secondary: {
        backgroundColor: Colors.surface.secondary,
        borderRadius: BorderRadius.button,
        height: 56,
        paddingHorizontal: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border.default,
      },
      danger: {
        backgroundColor: Colors.danger.default,
        borderRadius: BorderRadius.button,
        height: 56,
        paddingHorizontal: Spacing.lg,
      },
      ghost: {
        backgroundColor: Colors.transparent,
        borderRadius: BorderRadius.button,
        height: 48,
        paddingHorizontal: Spacing.md,
      },
    },
    statusBadge: {
      idle: {
        backgroundColor: Colors.surface.tertiary,
        color: Colors.text.secondary,
      },
      active: {
        backgroundColor: Colors.safe.tint,
        color: Colors.safe.default,
      },
      warning: {
        backgroundColor: Colors.warning.tint,
        color: Colors.warning.default,
      },
      sos: {
        backgroundColor: Colors.danger.tint,
        color: Colors.danger.default,
      },
      arrived: {
        backgroundColor: Colors.brand.tint,
        color: Colors.brand.primary,
      },
    },
  },

  // Animation durations (ms)
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
    sosTransition: 600,
  },
} as const;

export type AegisTheme = typeof Theme;
