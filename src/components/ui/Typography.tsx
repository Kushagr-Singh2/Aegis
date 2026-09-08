/**
 * Typography components
 *
 * Typed text components for consistent font usage.
 * All use design token values — no inline fontSize/fontFamily in other files.
 */

import React from 'react';
import { Text, type TextProps, type TextStyle, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, LineHeight, LetterSpacing } from '../../constants/typography';

// ── Base component ───────────────────────────────────────────────────────────

type BaseTextProps = TextProps & {
  color?: string;
  align?: TextStyle['textAlign'];
  children?: React.ReactNode;
};

function makeTextComponent(baseStyle: TextStyle) {
  return function AegisText({ style, color, align, children, ...rest }: BaseTextProps) {
    return (
      <Text
        style={[
          baseStyle,
          color ? { color } : undefined,
          align ? { textAlign: align } : undefined,
          style,
        ]}
        {...rest}
      >
        {children}
      </Text>
    );
  };
}

// ── Exported components ──────────────────────────────────────────────────────

/** Large display heading for hero sections */
export const DisplayLarge = makeTextComponent({
  fontFamily: FontFamily.displayBold,
  fontSize: FontSize.d2,
  lineHeight: FontSize.d2 * LineHeight.tight,
  letterSpacing: LetterSpacing.tight,
  color: Colors.text.primary,
});

/** Screen-level heading */
export const Heading1 = makeTextComponent({
  fontFamily: FontFamily.displayBold,
  fontSize: FontSize.h1,
  lineHeight: FontSize.h1 * LineHeight.snug,
  letterSpacing: LetterSpacing.tight,
  color: Colors.text.primary,
});

/** Section heading */
export const Heading2 = makeTextComponent({
  fontFamily: FontFamily.displaySemiBold,
  fontSize: FontSize.h2,
  lineHeight: FontSize.h2 * LineHeight.snug,
  color: Colors.text.primary,
});

/** Card/sub-section heading */
export const Heading3 = makeTextComponent({
  fontFamily: FontFamily.bodySemiBold,
  fontSize: FontSize.h3,
  lineHeight: FontSize.h3 * LineHeight.snug,
  color: Colors.text.primary,
});

/** Small heading */
export const Heading4 = makeTextComponent({
  fontFamily: FontFamily.bodySemiBold,
  fontSize: FontSize.h4,
  lineHeight: FontSize.h4 * LineHeight.normal,
  color: Colors.text.primary,
});

/** Standard body text */
export const BodyLarge = makeTextComponent({
  fontFamily: FontFamily.bodyRegular,
  fontSize: FontSize.lg,
  lineHeight: FontSize.lg * LineHeight.relaxed,
  color: Colors.text.primary,
});

/** Standard body text */
export const Body = makeTextComponent({
  fontFamily: FontFamily.bodyRegular,
  fontSize: FontSize.md,
  lineHeight: FontSize.md * LineHeight.relaxed,
  color: Colors.text.primary,
});

/** Secondary / muted body text */
export const BodySecondary = makeTextComponent({
  fontFamily: FontFamily.bodyRegular,
  fontSize: FontSize.md,
  lineHeight: FontSize.md * LineHeight.relaxed,
  color: Colors.text.secondary,
});

/** Small text */
export const BodySmall = makeTextComponent({
  fontFamily: FontFamily.bodyRegular,
  fontSize: FontSize.sm,
  lineHeight: FontSize.sm * LineHeight.normal,
  color: Colors.text.secondary,
});

/** All-caps label */
export const Label = makeTextComponent({
  fontFamily: FontFamily.bodyMedium,
  fontSize: FontSize.label,
  letterSpacing: LetterSpacing.widest,
  color: Colors.text.tertiary,
  textTransform: 'uppercase',
});

/** Caption / fine print */
export const Caption = makeTextComponent({
  fontFamily: FontFamily.bodyRegular,
  fontSize: FontSize.xs,
  lineHeight: FontSize.xs * LineHeight.normal,
  color: Colors.text.tertiary,
});

/** Emergency display — largest, boldest */
export const EmergencyText = makeTextComponent({
  fontFamily: FontFamily.displayBold,
  fontSize: FontSize.d1,
  lineHeight: FontSize.d1 * LineHeight.tight,
  letterSpacing: LetterSpacing.tight,
  color: Colors.text.primary,
});

// Suppress unused variable warning
void StyleSheet;
