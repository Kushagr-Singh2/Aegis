// ============================================================
// src/services/routeDeviation.service.ts
// Route Deviation Detection Service.
//
// Calculates cross-track distance between the user's current GPS
// coordinate and the planned route polyline.
//
// Note: Deviation is a risk signal — it does NOT trigger an emergency
// on its own, but feeds into the risk engine.
// ============================================================

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export type PlannedRouteInput =
  | RoutePoint[]
  | Array<{ lat: number; lng: number }>
  | Array<[number, number]> // [lng, lat] or [lat, lng]
  | { coordinates: Array<[number, number]> | RoutePoint[] }
  | { type: 'LineString'; coordinates: Array<[number, number]> }
  | null
  | undefined;

export interface CheckRouteDeviationParams {
  currentLatitude: number;
  currentLongitude: number;
  plannedRoute: PlannedRouteInput;
  /** Distance threshold in meters beyond which deviation is detected. Defaults to 100m. */
  thresholdMeters?: number;
  /** Timestamp when deviation was first detected (ISO string, epoch ms, or Date). */
  deviationStartedAt?: string | number | Date | null;
  /** Timestamp of the current ping. Defaults to now. */
  currentTimestamp?: string | number | Date | null;
}

export interface RouteDeviationResult {
  distance_from_route: number; // in meters (rounded to 1 decimal place)
  deviation_duration: number; // in seconds
  deviation_detected: boolean;
}

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Standard Haversine distance between two coordinates in meters.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Normalizes varied route formats into an array of { latitude, longitude }.
 */
export function normalizeRoute(plannedRoute: PlannedRouteInput): RoutePoint[] {
  if (!plannedRoute) return [];

  let rawPoints: unknown[] = [];

  if (Array.isArray(plannedRoute)) {
    rawPoints = plannedRoute;
  } else if (typeof plannedRoute === 'object') {
    if ('coordinates' in plannedRoute && Array.isArray(plannedRoute.coordinates)) {
      rawPoints = plannedRoute.coordinates;
    }
  }

  const normalized: RoutePoint[] = [];

  for (const p of rawPoints) {
    if (!p) continue;
    if (typeof p === 'object') {
      if ('latitude' in p && 'longitude' in p) {
        const pt = p as { latitude: number; longitude: number };
        if (typeof pt.latitude === 'number' && typeof pt.longitude === 'number') {
          normalized.push({ latitude: pt.latitude, longitude: pt.longitude });
        }
      } else if ('lat' in p && 'lng' in p) {
        const pt = p as { lat: number; lng: number };
        if (typeof pt.lat === 'number' && typeof pt.lng === 'number') {
          normalized.push({ latitude: pt.lat, longitude: pt.lng });
        }
      } else if (Array.isArray(p) && p.length >= 2) {
        const [first, second] = p as [number, number];
        // GeoJSON standard is [longitude, latitude] where abs(lon) <= 180 and abs(lat) <= 90
        if (Math.abs(first) <= 180 && Math.abs(second) <= 90 && Math.abs(first) > 90) {
          normalized.push({ longitude: first, latitude: second });
        } else {
          // Default heuristic: assume [lat, lon] if lat in valid range
          normalized.push({ latitude: first, longitude: second });
        }
      }
    }
  }

  return normalized;
}

/**
 * Calculates perpendicular distance from point P to line segment AB in meters.
 * Uses local equidistant Cartesian projection which is highly accurate for local distances.
 */
function distanceToSegment(
  p: RoutePoint,
  a: RoutePoint,
  b: RoutePoint
): number {
  const avgLat = toRadians((a.latitude + b.latitude + p.latitude) / 3);
  const cosLat = Math.cos(avgLat);

  // Convert to local Cartesian coordinates (meters)
  const ax = toRadians(a.longitude) * EARTH_RADIUS_METERS * cosLat;
  const ay = toRadians(a.latitude) * EARTH_RADIUS_METERS;

  const bx = toRadians(b.longitude) * EARTH_RADIUS_METERS * cosLat;
  const by = toRadians(b.latitude) * EARTH_RADIUS_METERS;

  const px = toRadians(p.longitude) * EARTH_RADIUS_METERS * cosLat;
  const py = toRadians(p.latitude) * EARTH_RADIUS_METERS;

  const dx = bx - ax;
  const dy = by - ay;
  const segLenSq = dx * dx + dy * dy;

  if (segLenSq === 0) {
    return Math.hypot(px - ax, py - ay);
  }

  // Projection parameter t clamped to [0, 1]
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / segLenSq));
  const projX = ax + t * dx;
  const projY = ay + t * dy;

  return Math.hypot(px - projX, py - projY);
}

/**
 * Calculates the shortest distance in meters from a coordinate to any segment
 * of a polyline route.
 */
export function calculateDistanceFromRoute(
  point: RoutePoint,
  route: RoutePoint[]
): number {
  if (route.length === 0) return 0;
  if (route.length === 1) {
    return calculateHaversineDistance(
      point.latitude,
      point.longitude,
      route[0].latitude,
      route[0].longitude
    );
  }

  let minDistance = Infinity;

  for (let i = 0; i < route.length - 1; i++) {
    const d = distanceToSegment(point, route[i], route[i + 1]);
    if (d < minDistance) {
      minDistance = d;
    }
  }

  return minDistance;
}

/**
 * Evaluates route deviation for a given current coordinate and planned route.
 *
 * @returns {RouteDeviationResult}
 *   - distance_from_route: distance in meters
 *   - deviation_duration: seconds since deviation began (0 if not deviated or no startTime)
 *   - deviation_detected: true if distance_from_route > thresholdMeters
 */
export function checkRouteDeviation(
  params: CheckRouteDeviationParams
): RouteDeviationResult {
  const threshold = params.thresholdMeters ?? 100;
  const normalizedRoute = normalizeRoute(params.plannedRoute);

  const currentPoint: RoutePoint = {
    latitude: params.currentLatitude,
    longitude: params.currentLongitude,
  };

  const distance = calculateDistanceFromRoute(currentPoint, normalizedRoute);
  const isDeviated = distance > threshold;

  let durationSeconds = 0;

  if (isDeviated && params.deviationStartedAt) {
    const startMs = new Date(params.deviationStartedAt).getTime();
    const currentMs = params.currentTimestamp
      ? new Date(params.currentTimestamp).getTime()
      : Date.now();
    durationSeconds = Math.max(0, Math.floor((currentMs - startMs) / 1000));
  }

  return {
    distance_from_route: Math.round(distance * 10) / 10,
    deviation_duration: durationSeconds,
    deviation_detected: isDeviated,
  };
}
