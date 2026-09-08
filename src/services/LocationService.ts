/**
 * AEGIS LocationService — Android GPS & Geofence Abstraction
 *
 * Provides:
 * - Mock GPS location telemetry (coordinates, accuracy, speed, heading)
 * - Route deviation distance computation
 * - Geofence detection for safe zones / destinations
 * - Background position updates subscription
 */

export type LocationCoordinates = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  speedMps: number;
  headingDegrees: number;
  timestamp: number;
};

export type LocationListener = (location: LocationCoordinates) => void;

// Mock base coordinates: Connaught Place, New Delhi
const DEFAULT_COORDINATES: LocationCoordinates = {
  latitude: 28.6328,
  longitude: 77.2197,
  accuracyMeters: 4.2,
  speedMps: 6.8, // ~24 km/h
  headingDegrees: 45,
  timestamp: Date.now(),
};

export const LocationService = {
  /**
   * Retrieves the latest known user location.
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    console.log('[LocationService] getCurrentLocation (Mock GPS)');
    return {
      ...DEFAULT_COORDINATES,
      timestamp: Date.now(),
    };
  },

  /**
   * Subscribes to periodic location updates along the journey.
   */
  watchPosition(listener: LocationListener): () => void {
    console.log('[LocationService] Subscribing to mock GPS position updates');
    const interval = setInterval(() => {
      listener({
        ...DEFAULT_COORDINATES,
        latitude: DEFAULT_COORDINATES.latitude + (Math.random() - 0.5) * 0.0005,
        longitude: DEFAULT_COORDINATES.longitude + (Math.random() - 0.5) * 0.0005,
        timestamp: Date.now(),
      });
    }, 5000);

    return () => {
      console.log('[LocationService] Unsubscribing from mock GPS updates');
      clearInterval(interval);
    };
  },

  /**
   * Computes mock distance off planned corridor.
   * Returns deviation in metres.
   */
  calculateRouteDeviation(plannedRouteId: string): number {
    console.log(`[LocationService] Calculating deviation from ${plannedRouteId}`);
    // Simulated deviation: 180m during anomaly scenarios, 15m normally
    return 180;
  },

  /**
   * Checks if current coordinates are within radius of destination or safe zone.
   */
  isWithinGeofence(targetLat: number, targetLng: number, radiusMeters: number): boolean {
    console.log(`[LocationService] Checking geofence: radius ${radiusMeters}m`);
    return false;
  },
} as const;
