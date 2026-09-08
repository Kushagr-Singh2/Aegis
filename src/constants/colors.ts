/**
 * AEGIS Design Tokens — Color Palette
 *
 * Semantic naming: prefer semantic tokens (e.g. Colors.surface.primary)
 * over raw values in component code.
 */

// ── Raw palette ────────────────────────────────────────────────────────────

const palette = {
  // Neutrals
  obsidian100: '#0A0B0F',
  obsidian200: '#0F1117',
  obsidian300: '#13151C',
  obsidian400: '#1C1E28',
  obsidian500: '#252836',

  // Text
  white: '#FFFFFF',
  frost100: '#F0F2F8',
  frost200: '#C8CCDB',
  frost300: '#8B92A8',
  frost400: '#555D75',

  // Brand — Shield Blue (trustworthy, calm)
  blue100: '#EBF4FF',
  blue200: '#A8D4FF',
  blue400: '#4A90D9',
  blue500: '#2D7AC5',
  blue600: '#1A5F9E',

  // Safety Green (active, safe, positive)
  green100: '#E0FBF4',
  green400: '#00C896',
  green500: '#00A87D',
  green600: '#007D5C',

  // Warning Amber (elevated risk)
  amber100: '#FFF5E0',
  amber400: '#F5A623',
  amber500: '#D4881A',
  amber600: '#AA6B12',

  // Emergency Red (SOS, critical)
  red100: '#FDECEA',
  red300: '#F28B82',
  red500: '#E53935',
  red600: '#C62828',
  red700: '#8B0000',

  // Transparent overlays
  blackOverlay10: 'rgba(0,0,0,0.10)',
  blackOverlay30: 'rgba(0,0,0,0.30)',
  blackOverlay60: 'rgba(0,0,0,0.60)',
  blackOverlay80: 'rgba(0,0,0,0.80)',
  whiteOverlay05: 'rgba(255,255,255,0.05)',
  whiteOverlay10: 'rgba(255,255,255,0.10)',
  whiteOverlay15: 'rgba(255,255,255,0.15)',
} as const;

// ── Semantic tokens ────────────────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  background: {
    primary: palette.obsidian100,   // main screen background
    secondary: palette.obsidian200, // slightly elevated
    elevated: palette.obsidian300,  // cards, sheets
    overlay: palette.blackOverlay80,
  },

  // Surfaces (cards, modals)
  surface: {
    primary: palette.obsidian300,
    secondary: palette.obsidian400,
    tertiary: palette.obsidian500,
    glass: palette.whiteOverlay05,
  },

  // Borders
  border: {
    subtle: palette.whiteOverlay05,
    default: palette.whiteOverlay10,
    strong: palette.whiteOverlay15,
    focus: palette.blue400,
  },

  // Text
  text: {
    primary: palette.frost100,
    secondary: palette.frost300,
    tertiary: palette.frost400,
    inverse: palette.obsidian100,
    link: palette.blue400,
    danger: palette.red500,
  },

  // Brand / Primary actions
  brand: {
    primary: palette.blue400,
    primaryDark: palette.blue500,
    primaryDeep: palette.blue600,
    primaryLight: palette.blue200,
    tint: 'rgba(74,144,217,0.12)',
  },

  // Journey status — Safe
  safe: {
    default: palette.green400,
    dark: palette.green500,
    deep: palette.green600,
    tint: 'rgba(0,200,150,0.12)',
    textOnSafe: palette.white,
  },

  // Journey status — Warning
  warning: {
    default: palette.amber400,
    dark: palette.amber500,
    deep: palette.amber600,
    tint: 'rgba(245,166,35,0.12)',
  },

  // Journey status — Danger / SOS
  danger: {
    default: palette.red500,
    dark: palette.red600,
    deep: palette.red700,
    light: palette.red300,
    tint: 'rgba(229,57,53,0.15)',
    extreme: '#FF1744',
  },

  // Misc
  transparent: 'transparent',
  white: palette.white,
  black: '#000000',
} as const;

export type ColorToken = typeof Colors;
