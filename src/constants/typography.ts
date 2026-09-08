/**
 * AEGIS Typography Scale
 *
 * Font families map to system/loaded fonts.
 * Use via Typography.* in StyleSheet definitions.
 */

export const FontFamily = {
  // Primary display font (loaded via expo-font)
  displayBold: 'Outfit-Bold',
  displaySemiBold: 'Outfit-SemiBold',
  displayMedium: 'Outfit-Medium',
  displayRegular: 'Outfit-Regular',

  // Body / UI font
  bodyBold: 'Inter-Bold',
  bodySemiBold: 'Inter-SemiBold',
  bodyMedium: 'Inter-Medium',
  bodyRegular: 'Inter-Regular',

  // Monospace (e.g. coordinates, code)
  mono: 'SpaceMono-Regular',
} as const;

export const FontSize = {
  // Display
  d1: 40,  // Hero/emergency heading
  d2: 32,  // Section heading
  d3: 28,  // Screen title

  // Heading
  h1: 24,
  h2: 20,
  h3: 18,
  h4: 16,

  // Body
  lg: 16,
  md: 14,
  sm: 13,
  xs: 12,

  // Label / Badge
  label: 11,
  caption: 10,
} as const;

export const LineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
  widest: 2.0,
} as const;

export const Typography = {
  // Hero / Emergency
  emergencyHeading: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.d1,
    lineHeight: FontSize.d1 * LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
  },
  // Screen titles
  displayLarge: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.d3,
    lineHeight: FontSize.d3 * LineHeight.snug,
    letterSpacing: LetterSpacing.tight,
  },
  displayMedium: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.h1,
    lineHeight: FontSize.h1 * LineHeight.snug,
    letterSpacing: LetterSpacing.normal,
  },
  // Card / section headings
  headingLarge: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.h2,
    lineHeight: FontSize.h2 * LineHeight.snug,
  },
  headingMedium: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.h3,
    lineHeight: FontSize.h3 * LineHeight.snug,
  },
  headingSmall: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.h4,
    lineHeight: FontSize.h4 * LineHeight.normal,
  },
  // Body
  bodyLarge: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * LineHeight.relaxed,
  },
  bodyMedium: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * LineHeight.relaxed,
  },
  bodySmall: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  // Labels / captions
  labelLarge: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    letterSpacing: LetterSpacing.wider,
  },
  labelSmall: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.label,
    letterSpacing: LetterSpacing.widest,
  },
  caption: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
} as const;
