/**
 * AEGIS EmergencyDialer — Android abstraction layer
 *
 * PURPOSE:
 *   Provides a clean abstraction over Android's phone dialer intent.
 *   Current implementation is a MOCK for frontend development.
 *
 * ANDROID INTEGRATION NOTE (Future):
 *   The production implementation MUST use:
 *     Intent.ACTION_DIAL with uri tel:{number}
 *   via React Native's Linking.openURL(`tel:${number}`)
 *
 *   This opens the Android dialer with the number pre-filled.
 *   The USER manually presses the call button — NO automatic calling.
 *
 *   NEVER USE:
 *     - Intent.ACTION_CALL  (auto-dials without user confirmation)
 *   NEVER REQUEST:
 *     - CALL_PHONE permission
 *
 * USAGE:
 *   import { EmergencyDialer } from '@lib/EmergencyDialer';
 *   EmergencyDialer.openDialer('112');
 *   EmergencyDialer.openDialer(contact.phoneNumber);
 */

import { Alert, Linking, Platform } from 'react-native';

// ── Types ────────────────────────────────────────────────────────────────────

export type DialerCallbackResult = {
  success: boolean;
  number: string;
  error?: string;
};

export type DialerCallback = (result: DialerCallbackResult) => void;

// ── Configuration ────────────────────────────────────────────────────────────

const EMERGENCY_NUMBER = '112';

/**
 * Whether to use the real Linking API.
 * Set to false during development/testing for mock behaviour.
 */
const USE_REAL_LINKING = false;

// ── Mock implementation ──────────────────────────────────────────────────────

function mockOpenDialer(number: string, callback?: DialerCallback): void {
  console.log(`[EmergencyDialer MOCK] Would open Android dialer with: tel:${number}`);
  console.log('[EmergencyDialer MOCK] Production: uses Intent.ACTION_DIAL — user confirms call');

  Alert.alert(
    '📞 Dialer (Mock)',
    `In production, this opens the Android dialer with ${number} pre-filled.\n\nThe user presses Call manually.\n\nNever auto-dials.`,
    [
      {
        text: 'OK',
        onPress: () => {
          callback?.({ success: true, number });
        },
      },
    ],
    { cancelable: false }
  );
}

// ── Real implementation (activated when USE_REAL_LINKING = true) ──────────────

async function realOpenDialer(number: string, callback?: DialerCallback): Promise<void> {
  const url = `tel:${number}`;
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      callback?.({ success: true, number });
    } else {
      const errMsg = `Cannot open dialer for ${url}`;
      console.warn(`[EmergencyDialer] ${errMsg}`);
      callback?.({ success: false, number, error: errMsg });
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[EmergencyDialer] Error opening dialer: ${errMsg}`);
    callback?.({ success: false, number, error: errMsg });
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export const EmergencyDialer = {
  /**
   * Opens the Android/iOS dialer with the given number pre-filled.
   * The user must manually press the call button.
   *
   * Android: Intent.ACTION_DIAL with tel:{number}
   * iOS: Linking.openURL(`tel:${number}`)
   *
   * @param number - Phone number string (digits, +, hyphens allowed)
   * @param callback - Optional result callback
   */
  openDialer(number: string, callback?: DialerCallback): void {
    const sanitized = number.replace(/[^\d+\-() ]/g, '');
    if (!sanitized) {
      console.warn('[EmergencyDialer] Invalid phone number provided');
      callback?.({ success: false, number, error: 'Invalid phone number' });
      return;
    }

    if (USE_REAL_LINKING) {
      void realOpenDialer(sanitized, callback);
    } else {
      mockOpenDialer(sanitized, callback);
    }
  },

  /**
   * Convenience method: Opens dialer for the universal emergency number.
   */
  callEmergency(callback?: DialerCallback): void {
    EmergencyDialer.openDialer(EMERGENCY_NUMBER, callback);
  },

  /** The configured emergency number */
  emergencyNumber: EMERGENCY_NUMBER,

  /** Whether running in mock mode */
  isMock: !USE_REAL_LINKING,

  /** Platform info for debugging */
  platform: Platform.OS,
} as const;
