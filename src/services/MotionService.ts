/**
 * AEGIS MotionService — Android Accelerometer & Gyroscope Telemetry
 *
 * Provides:
 * - Motion state classification: MOVING, STOPPED, ABNORMAL, IMPACT
 * - Prolonged stationary stop monitoring
 * - Rapid deceleration / anomaly detection
 */

export type MotionState = 'MOVING' | 'STOPPED' | 'ANOMALY' | 'IMPACT';

export type MotionTelemetry = {
  acceleration: { x: number; y: number; z: number };
  motionState: MotionState;
  stationaryDurationSeconds: number;
  timestamp: number;
};

export type MotionListener = (telemetry: MotionTelemetry) => void;

export const MotionService = {
  /**
   * Starts motion monitoring service during active journey.
   */
  startMonitoring(onAnomalyDetected?: (anomalyType: string) => void): () => void {
    console.log('[MotionService] Accelerometer & Gyroscope monitoring started (Mock)');
    return () => {
      console.log('[MotionService] Motion monitoring stopped');
    };
  },

  /**
   * Gets instant mock telemetry snapshot.
   */
  getTelemetry(): MotionTelemetry {
    return {
      acceleration: { x: 0.1, y: 0.8, z: 9.8 },
      motionState: 'MOVING',
      stationaryDurationSeconds: 0,
      timestamp: Date.now(),
    };
  },

  /**
   * Simulates an anomaly event (e.g. unexpected prolonged stop or erratic motion).
   */
  simulateAnomaly(type: 'ABRUPT_STOP' | 'PROLONGED_IDLE'): void {
    console.log('[MotionService] Simulated motion anomaly event:', type);
  },
} as const;
