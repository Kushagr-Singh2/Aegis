/**
 * AEGIS NativeBridge — Android Native Hardware & Intent Bridge
 *
 * Provides a standardized contract for interacting with native Android services:
 * - Native capability detection
 * - Android Intent dispatching (ACTION_DIAL, ACTION_VIEW)
 * - Foreground service management
 * - Hardware sensor availability
 *
 * Current implementation: Mock layer for mobile frontend development.
 */

import { Platform, Alert } from 'react-native';

export type NativePlatformCapabilities = {
  hasTelephony: boolean;
  hasHardwareGps: boolean;
  hasAccelerometer: boolean;
  hasMicrophone: boolean;
  supportsForegroundService: boolean;
  androidSdkVersion?: number;
};

export const NativeBridge = {
  /** Platform identifier */
  platform: Platform.OS,

  /**
   * Discovers device hardware and OS capabilities.
   */
  async getCapabilities(): Promise<NativePlatformCapabilities> {
    console.log('[NativeBridge] Probing Android hardware capabilities (Mock)');
    return {
      hasTelephony: true,
      hasHardwareGps: true,
      hasAccelerometer: true,
      hasMicrophone: true,
      supportsForegroundService: Platform.OS === 'android',
      androidSdkVersion: Platform.OS === 'android' ? 34 : undefined,
    };
  },

  /**
   * Starts an Android foreground service for persistent journey safety monitoring.
   * In production, this binds to AegisSafetyForegroundService.
   */
  async startForegroundSafetyService(title: string, message: string): Promise<boolean> {
    console.log(`[NativeBridge] Starting Foreground Service: "${title}" - "${message}"`);
    return true;
  },

  /**
   * Stops the active foreground safety service upon journey conclusion.
   */
  async stopForegroundSafetyService(): Promise<boolean> {
    console.log('[NativeBridge] Stopping Foreground Safety Service');
    return true;
  },

  /**
   * Dispatches a safe Android intent.
   * Strictly enforces Intent.ACTION_DIAL for phone calls. Never dispatches Intent.ACTION_CALL.
   */
  async dispatchIntent(action: 'ACTION_DIAL' | 'ACTION_VIEW', uri: string): Promise<boolean> {
    console.log(`[NativeBridge] Dispatching Intent: ${action} -> ${uri}`);
    if (action === 'ACTION_DIAL') {
      console.log('[NativeBridge] Compliant: User will manually press Call in native dialer');
    }
    return true;
  },

  /**
   * Triggers device haptic feedback / vibration pattern for emergency warnings.
   */
  triggerEmergencyVibration(pattern: number[] = [0, 200, 100, 200]): void {
    console.log('[NativeBridge] Triggering emergency haptic pattern:', pattern);
  },
} as const;
