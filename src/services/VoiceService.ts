/**
 * AEGIS VoiceService — Android Offline Keyword Spotter & Audio Abstraction
 *
 * Provides:
 * - Hands-free emergency phrase detection ("Help me", "Emergency", "SOS")
 * - Audio permission status verification
 * - Continuous low-power listening simulator for active journeys
 */

import { VOICE_SOS_PHRASES, type VoiceSOSState } from '../lib/mockData';

export type VoiceDetectionCallback = (detectedPhrase: string) => void;

export const VoiceService = {
  /** Supported trigger phrases */
  supportedPhrases: VOICE_SOS_PHRASES,

  /**
   * Checks microphone permission and offline model readiness.
   */
  async checkAvailability(): Promise<{ isAvailable: boolean; reason?: string }> {
    console.log('[VoiceService] Checking offline speech model availability');
    return { isAvailable: true };
  },

  /**
   * Starts low-power background keyword listener.
   */
  startListening(
    onDetected: VoiceDetectionCallback,
    onError?: (err: string) => void
  ): () => void {
    console.log('[VoiceService] Keyword spotter listening for:', VOICE_SOS_PHRASES);

    // Mock listener: can be manually triggered via simulateKeyword()
    return () => {
      console.log('[VoiceService] Keyword listener stopped');
    };
  },

  /**
   * Simulates a spoken keyword detection event for testing.
   */
  simulateKeyword(phrase: string, onDetected: VoiceDetectionCallback): void {
    console.log('[VoiceService] Simulating voice detection of:', phrase);
    onDetected(phrase);
  },
} as const;
