// ============================================================
// src/services/routing.service.ts
// Server-Side TomTom Routing & Traffic Service.
//
// Calculates primary and alternative routes with real-time traffic
// delay, route geometry (polyline), distance, and ETA.
//
// Security:
//   - TOMTOM_API_KEY is read securely from process.env on the server.
//   - Never exposes API keys to client responses.
//   - Includes resilient fallback route estimation when offline
//     or when API key is not configured.
// ============================================================

import { calculateHaversineDistance, type RoutePoint } from './routeDeviation.service';


export interface LatLng {
  latitude: number;
  longitude: number;
}

export type LocationInput = LatLng | { lat: number; lng: number } | string | [number, number];

export interface CalculateRoutesParams {
  origin: LocationInput;
  destination: LocationInput;
  /** Maximum alternative routes to request (1 to 4). Defaults to 2. */
  maxAlternatives?: number;
  /** Travel mode: 'car' | 'pedestrian' | 'bicycle'. Defaults to 'car'. */
  travelMode?: 'car' | 'pedestrian' | 'bicycle';
  /** Compute with live traffic. Defaults to true. */
  traffic?: boolean;
}

export interface RouteTrafficInfo {
  trafficDelaySeconds: number;
  trafficLengthMeters: number;
  hasHeavyTraffic: boolean;
  trafficCongestionLevel: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface RouteOption {
  id: string;
  isAlternative: boolean;
  distanceMeters: number;
  distanceKm: number;
  travelTimeSeconds: number;
  etaMinutes: number;
  expectedArrival: string; // ISO timestamp
  polyline: RoutePoint[];
  traffic: RouteTrafficInfo;
  travelMode: 'car' | 'pedestrian' | 'bicycle';
}

export interface CalculateRoutesResult {
  success: boolean;
  routes: RouteOption[];
  primaryRoute: RouteOption;
  source: 'tomtom_api' | 'fallback_estimation';
  error?: string;
}

function parseLocation(loc: LocationInput): LatLng {
  if (typeof loc === 'string') {
    const parts = loc.split(',').map((s) => parseFloat(s.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { latitude: parts[0], longitude: parts[1] };
    }
    throw new Error(`Invalid location coordinate string: "${loc}"`);
  }
  if (Array.isArray(loc) && loc.length >= 2) {
    return { latitude: loc[0], longitude: loc[1] };
  }
  if (typeof loc === 'object' && loc !== null) {
    if ('latitude' in loc && 'longitude' in loc) {
      return { latitude: loc.latitude, longitude: loc.longitude };
    }
    if ('lat' in loc && 'lng' in loc) {
      return { latitude: loc.lat, longitude: loc.lng };
    }
  }
  throw new Error(`Unrecognized location format: ${JSON.stringify(loc)}`);
}

/**
 * Builds a fallback route estimate using geodesic interpolation when the
 * TomTom API key is not present or when the API is temporarily unreachable.
 */
export function buildFallbackRoutes(
  origin: LatLng,
  destination: LatLng,
  travelMode: 'car' | 'pedestrian' | 'bicycle' = 'car',
  maxAlternatives: number = 2
): CalculateRoutesResult {
  const directDistance = calculateHaversineDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );

  // Urban road winding factor (1.3 for driving, 1.15 for walking)
  const windingFactor = travelMode === 'pedestrian' ? 1.15 : 1.3;
  const primaryDistance = Math.round(directDistance * windingFactor);

  // Speed in m/s: pedestrian ~1.3 m/s (~4.7 km/h), car ~9.7 m/s (~35 km/h urban)
  const speedMps = travelMode === 'pedestrian' ? 1.3 : travelMode === 'bicycle' ? 4.2 : 9.7;
  const baseTravelTime = Math.round(primaryDistance / speedMps);

  const now = Date.now();
  const routes: RouteOption[] = [];

  // Generate primary route
  const primarySteps = 8;
  const primaryPolyline: RoutePoint[] = [];
  for (let i = 0; i <= primarySteps; i++) {
    const t = i / primarySteps;
    primaryPolyline.push({
      latitude: Math.round((origin.latitude + (destination.latitude - origin.latitude) * t) * 1e6) / 1e6,
      longitude: Math.round((origin.longitude + (destination.longitude - origin.longitude) * t) * 1e6) / 1e6,
    });
  }

  const primary: RouteOption = {
    id: 'route-primary',
    isAlternative: false,
    distanceMeters: primaryDistance,
    distanceKm: Math.round((primaryDistance / 1000) * 10) / 10,
    travelTimeSeconds: baseTravelTime,
    etaMinutes: Math.ceil(baseTravelTime / 60),
    expectedArrival: new Date(now + baseTravelTime * 1000).toISOString(),
    polyline: primaryPolyline,
    traffic: {
      trafficDelaySeconds: travelMode === 'car' ? 120 : 0,
      trafficLengthMeters: travelMode === 'car' ? Math.round(primaryDistance * 0.15) : 0,
      hasHeavyTraffic: false,
      trafficCongestionLevel: 'LOW',
    },
    travelMode,
  };
  routes.push(primary);

  // Generate alternative route(s) if requested
  const alternativesToGenerate = Math.min(maxAlternatives, 2);
  for (let altIdx = 1; altIdx <= alternativesToGenerate; altIdx++) {
    const distanceMult = 1 + altIdx * 0.08;
    const altDistance = Math.round(primaryDistance * distanceMult);
    const altTime = Math.round(baseTravelTime * distanceMult + (altIdx === 1 ? 60 : 180));

    // Slight lateral bow to simulate parallel corridor
    const altPolyline: RoutePoint[] = [];
    const lateralOffset = (altIdx === 1 ? 0.003 : -0.003);
    for (let i = 0; i <= primarySteps; i++) {
      const t = i / primarySteps;
      const bow = Math.sin(t * Math.PI) * lateralOffset;
      altPolyline.push({
        latitude: Math.round((origin.latitude + (destination.latitude - origin.latitude) * t + bow) * 1e6) / 1e6,
        longitude: Math.round((origin.longitude + (destination.longitude - origin.longitude) * t + bow) * 1e6) / 1e6,
      });
    }

    routes.push({
      id: `route-alt-${altIdx}`,
      isAlternative: true,
      distanceMeters: altDistance,
      distanceKm: Math.round((altDistance / 1000) * 10) / 10,
      travelTimeSeconds: altTime,
      etaMinutes: Math.ceil(altTime / 60),
      expectedArrival: new Date(now + altTime * 1000).toISOString(),
      polyline: altPolyline,
      traffic: {
        trafficDelaySeconds: travelMode === 'car' ? altIdx * 180 : 0,
        trafficLengthMeters: travelMode === 'car' ? Math.round(altDistance * 0.2) : 0,
        hasHeavyTraffic: altIdx > 1,
        trafficCongestionLevel: altIdx === 1 ? 'MODERATE' : 'HIGH',
      },
      travelMode,
    });
  }

  return {
    success: true,
    routes,
    primaryRoute: routes[0],
    source: 'fallback_estimation',
  };
}

/**
 * Calculates primary and alternative routes via TomTom Routing API,
 * falling back gracefully to geodesic estimation if the API key
 * is absent or the endpoint is unreachable.
 */
export async function calculateRoutes(
  params: CalculateRoutesParams
): Promise<CalculateRoutesResult> {
  let originPt: LatLng;
  let destPt: LatLng;

  try {
    originPt = parseLocation(params.origin);
    destPt = parseLocation(params.destination);
  } catch (err) {
    return {
      success: false,
      routes: [],
      primaryRoute: {} as RouteOption,
      source: 'fallback_estimation',
      error: (err as Error).message,
    };
  }

  const travelMode = params.travelMode ?? 'car';
  const maxAlternatives = params.maxAlternatives ?? 2;
  const apiKey = process.env.TOMTOM_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-tomtom-api-key-here') {
    // Graceful fallback when API key is not configured
    return buildFallbackRoutes(originPt, destPt, travelMode, maxAlternatives);
  }

  try {
    const locations = `${originPt.latitude},${originPt.longitude}:${destPt.latitude},${destPt.longitude}`;
    const url = new URL(
      `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json`
    );

    url.searchParams.set('key', apiKey);
    url.searchParams.set('traffic', params.traffic !== false ? 'true' : 'false');
    url.searchParams.set('maxAlternatives', maxAlternatives.toString());
    url.searchParams.set('travelMode', travelMode);
    url.searchParams.set('computeTravelTimeFor', 'all');

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[TomTom Routing API] Error ${response.status}: ${errorText}`);
      // Fallback to estimation on HTTP error
      const fallback = buildFallbackRoutes(originPt, destPt, travelMode, maxAlternatives);
      fallback.error = `TomTom API HTTP ${response.status}`;
      return fallback;
    }

    const data: any = await response.json();

    if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
      return buildFallbackRoutes(originPt, destPt, travelMode, maxAlternatives);
    }

    const now = Date.now();
    const parsedRoutes: RouteOption[] = data.routes.map((r: any, idx: number) => {
      const summary = r.summary || {};
      const distance = summary.lengthInMeters || 0;
      const travelTime = summary.travelTimeInSeconds || 0;
      const delay = summary.trafficDelayInSeconds || 0;
      const trafficLength = summary.trafficLengthInMeters || 0;

      // Extract polyline points
      const polyline: RoutePoint[] = [];
      if (Array.isArray(r.legs)) {
        for (const leg of r.legs) {
          if (Array.isArray(leg.points)) {
            for (const pt of leg.points) {
              polyline.push({
                latitude: pt.latitude,
                longitude: pt.longitude,
              });
            }
          }
        }
      }

      let congestion: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
      if (delay > 300) congestion = 'HIGH';
      else if (delay > 90) congestion = 'MODERATE';

      return {
        id: `tomtom-route-${idx}`,
        isAlternative: idx > 0,
        distanceMeters: distance,
        distanceKm: Math.round((distance / 1000) * 10) / 10,
        travelTimeSeconds: travelTime,
        etaMinutes: Math.ceil(travelTime / 60),
        expectedArrival: summary.arrivalTime || new Date(now + travelTime * 1000).toISOString(),
        polyline,
        traffic: {
          trafficDelaySeconds: delay,
          trafficLengthMeters: trafficLength,
          hasHeavyTraffic: delay > 180,
          trafficCongestionLevel: congestion,
        },
        travelMode,
      };
    });

    return {
      success: true,
      routes: parsedRoutes,
      primaryRoute: parsedRoutes[0],
      source: 'tomtom_api',
    };
  } catch (err) {
    console.warn('[TomTom Routing API] Network error, falling back to estimation:', err);
    const fallback = buildFallbackRoutes(originPt, destPt, travelMode, maxAlternatives);
    fallback.error = (err as Error).message;
    return fallback;
  }
}
