// ============================================================
// src/services/nearbyPlaces.service.ts
// Nearby Assistance & Safe Destination Ranking Service.
//
// Categories:
//   - police        (Police stations, outposts)
//   - hospital      (Hospitals, urgent care centers)
//   - public_place  (24/7 transit hubs, commercial centers, service stations)
//
// Features:
//   1. Search nearby assistance places via TomTom POI search (with resilient fallback)
//   2. Rank safe refuge destinations using distance, ETA, place type,
//      open status, and estimated_activity (LOW, MEDIUM, HIGH)
//   3. Get directions from current location to selected assistance place
// ============================================================

import {
  calculateHaversineDistance,
  type RoutePoint,
} from './routeDeviation.service';
import {
  calculateRoutes,
  type CalculateRoutesResult,
  type LatLng,
  type LocationInput,
} from './routing.service';


export type AssistancePlaceType = 'police' | 'hospital' | 'public_place';

export type EstimatedActivityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface NearbyAssistancePlace {
  id: string;
  name: string;
  type: AssistancePlaceType;
  latitude: number;
  longitude: number;
  address: string;
  distanceMeters: number;
  distanceKm: number;
  walkingEtaMinutes: number | null;
  walkingEtaSeconds: number | null;
  isOpen: boolean | null;
  openStatusText?: string;
  estimated_activity: EstimatedActivityLevel;
  ranking_score?: number;
}

export interface SearchNearbyAssistanceParams {
  latitude: number;
  longitude: number;
  /** Search radius in meters. Defaults to 5000m (5km). */
  radiusMeters?: number;
  /** Filter to specific categories. Defaults to all three. */
  categories?: AssistancePlaceType[];
}

export interface SafeDestinationRankingResult {
  /** Top recommended place for immediate refuge */
  recommended_place: NearbyAssistancePlace;
  /** All candidates ranked in descending order of refuge suitability */
  ranked_places: NearbyAssistancePlace[];
  /** Advisory notice */
  advisory_notice: string;
}

export interface DirectionsToPlaceResult {
  destination: NearbyAssistancePlace;
  route: CalculateRoutesResult;
  directDistanceMeters: number;
}

/** Walking speed average: ~1.3 m/s (~4.7 km/h) */
const WALKING_SPEED_MPS = 1.3;

/**
 * Generates structured fallback assistance places around a coordinate
 * when TomTom API key is not configured or in offline/sandbox mode.
 */
function buildFallbackAssistancePlaces(
  centerLat: number,
  centerLng: number,
  categories: AssistancePlaceType[]
): NearbyAssistancePlace[] {
  const allTemplates: Array<Omit<NearbyAssistancePlace, 'distanceMeters' | 'distanceKm' | 'walkingEtaMinutes' | 'walkingEtaSeconds'>> = [
    {
      id: 'fallback-police-1',
      name: 'City Central Police Station',
      type: 'police',
      latitude: Math.round((centerLat + 0.0035) * 1e6) / 1e6, // ~400m North
      longitude: Math.round((centerLng + 0.002) * 1e6) / 1e6,
      address: 'Station Rd & Main St',
      isOpen: true,
      openStatusText: 'Open 24/7',
      estimated_activity: 'MEDIUM',
    },
    {
      id: 'fallback-hospital-1',
      name: 'Metro General Hospital Emergency Department',
      type: 'hospital',
      latitude: Math.round((centerLat - 0.006) * 1e6) / 1e6, // ~700m South
      longitude: Math.round((centerLng + 0.004) * 1e6) / 1e6,
      address: 'Medical Center Blvd',
      isOpen: true,
      openStatusText: 'Open 24/7',
      estimated_activity: 'HIGH',
    },
    {
      id: 'fallback-public-1',
      name: 'Central Metro Transit Hub & Commercial Plaza',
      type: 'public_place',
      latitude: Math.round((centerLat + 0.002) * 1e6) / 1e6, // ~300m Northeast
      longitude: Math.round((centerLng - 0.003) * 1e6) / 1e6,
      address: 'Civic Center Ave',
      isOpen: true,
      openStatusText: 'Open Now',
      estimated_activity: 'HIGH',
    },
    {
      id: 'fallback-public-2',
      name: '24/7 Service Station & Convenience Store',
      type: 'public_place',
      latitude: Math.round((centerLat - 0.0025) * 1e6) / 1e6, // ~350m Southwest
      longitude: Math.round((centerLng - 0.002) * 1e6) / 1e6,
      address: 'Expressway Service Way',
      isOpen: true,
      openStatusText: 'Open 24/7',
      estimated_activity: 'MEDIUM',
    },
  ];

  const filtered = allTemplates.filter((t) => categories.includes(t.type));

  return filtered.map((item) => {
    const dist = Math.round(
      calculateHaversineDistance(centerLat, centerLng, item.latitude, item.longitude)
    );
    const walkingSec = Math.round(dist / WALKING_SPEED_MPS);
    return {
      ...item,
      distanceMeters: dist,
      distanceKm: Math.round((dist / 1000) * 10) / 10,
      walkingEtaSeconds: walkingSec,
      walkingEtaMinutes: Math.ceil(walkingSec / 60),
    };
  });
}

/**
 * Searches for nearby assistance locations (police, hospital, public places).
 * Uses TomTom POI Search API when configured, or provides structured
 * fallback places.
 */
export async function searchNearbyAssistance(
  params: SearchNearbyAssistanceParams
): Promise<{ success: boolean; places: NearbyAssistancePlace[]; source: 'tomtom_api' | 'fallback_data'; error?: string }> {
  const { latitude, longitude } = params;
  const radius = params.radiusMeters ?? 5000;
  const categories: AssistancePlaceType[] = params.categories && params.categories.length > 0
    ? params.categories
    : ['police', 'hospital', 'public_place'];

  const apiKey = process.env.TOMTOM_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-tomtom-api-key-here') {
    const places = buildFallbackAssistancePlaces(latitude, longitude, categories);
    return { success: true, places, source: 'fallback_data' };
  }

  try {
    // TomTom POI category codes: 7322 = Police, 7321 = Hospital, 7311/7369/9942 = Public Hubs
    const categoryCodeMap: Record<AssistancePlaceType, string> = {
      police: '7322',
      hospital: '7321',
      public_place: '7311,7369,9942,7373',
    };

    const requestedCodes = categories.map((c) => categoryCodeMap[c]).join(',');

    const url = new URL(`https://api.tomtom.com/search/2/nearbySearch/.json`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('lat', latitude.toString());
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('radius', radius.toString());
    url.searchParams.set('categorySet', requestedCodes);
    url.searchParams.set('limit', '20');

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      console.warn(`[TomTom Search API] Error ${response.status}, using fallback.`);
      const places = buildFallbackAssistancePlaces(latitude, longitude, categories);
      return { success: true, places, source: 'fallback_data', error: `TomTom Search HTTP ${response.status}` };
    }

    const data: any = await response.json();
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      const places = buildFallbackAssistancePlaces(latitude, longitude, categories);
      return { success: true, places, source: 'fallback_data' };
    }

    const places: NearbyAssistancePlace[] = data.results.map((res: any) => {
      const pos = res.position || {};
      const poi = res.poi || {};
      const addr = res.address || {};

      // Determine place type
      let placeType: AssistancePlaceType = 'public_place';
      const catIds: number[] = Array.isArray(poi.categorySet)
        ? poi.categorySet.map((c: any) => c.id)
        : [];

      if (catIds.includes(7322) || poi.name?.toLowerCase().includes('police')) {
        placeType = 'police';
      } else if (catIds.includes(7321) || poi.name?.toLowerCase().includes('hospital')) {
        placeType = 'hospital';
      }

      const dist = Math.round(res.dist || calculateHaversineDistance(latitude, longitude, pos.lat, pos.lon));
      const walkingSec = Math.round(dist / WALKING_SPEED_MPS);

      // Estimate activity level without claiming exact headcounts
      let activity: EstimatedActivityLevel = 'MEDIUM';
      if (placeType === 'hospital' || catIds.includes(9942) || catIds.includes(7373)) {
        activity = 'HIGH';
      } else if (placeType === 'police') {
        activity = 'MEDIUM';
      } else if (dist > 3000) {
        activity = 'LOW';
      }

      const isOpen = placeType === 'police' || placeType === 'hospital' ? true : null;

      return {
        id: res.id || `poi-${pos.lat}-${pos.lon}`,
        name: poi.name || `${placeType.replace('_', ' ')} facility`,
        type: placeType,
        latitude: pos.lat,
        longitude: pos.lon,
        address: addr.freeformAddress || `${addr.streetName || ''} ${addr.municipality || ''}`.trim() || 'Address not listed',
        distanceMeters: dist,
        distanceKm: Math.round((dist / 1000) * 10) / 10,
        walkingEtaSeconds: walkingSec,
        walkingEtaMinutes: Math.ceil(walkingSec / 60),
        isOpen,
        openStatusText: isOpen === true ? 'Open 24/7' : undefined,
        estimated_activity: activity,
      };
    });

    return { success: true, places, source: 'tomtom_api' };
  } catch (err) {
    console.warn('[TomTom Search API] Network exception, using fallback places:', err);
    const places = buildFallbackAssistancePlaces(latitude, longitude, categories);
    return { success: true, places, source: 'fallback_data', error: (err as Error).message };
  }
}

/**
 * Safe Destination Ranking function.
 *
 * Evaluates candidate assistance places based on:
 *   - Proximity / Distance (closer places provide faster emergency refuge)
 *   - Walking ETA
 *   - Place Type:
 *       - Police: +35 (formal security, distress sanctuary)
 *       - Hospital: +30 (24/7 staff, medical security, lighting)
 *       - Public place: +20 (transit/commercial public refuge)
 *   - Open Status:
 *       - Open: +20
 *       - Closed: -30
 *   - Estimated Activity:
 *       - HIGH: +10 (well-populated witness density)
 *       - MEDIUM: +5
 *       - LOW: 0
 *
 * Output:
 *   - Returns `recommended_place` (top-ranked destination)
 *   - Returns `ranked_places` (full sorted list with ranking scores)
 */
export function rankSafeDestinations(
  places: NearbyAssistancePlace[]
): SafeDestinationRankingResult {
  if (!places || places.length === 0) {
    throw new Error('rankSafeDestinations requires at least one candidate place.');
  }

  const scored = places.map((place) => {
    let score = 50;

    // 1. Distance & ETA Factor (up to 30 points for closest places)
    // 0m = +30, 1000m = +20, 3000m = +5, >5000m = 0
    if (place.distanceMeters <= 500) {
      score += 30;
    } else if (place.distanceMeters <= 1200) {
      score += 22;
    } else if (place.distanceMeters <= 2500) {
      score += 14;
    } else if (place.distanceMeters <= 5000) {
      score += 6;
    }

    // 2. Place Type Factor
    if (place.type === 'police') {
      score += 35;
    } else if (place.type === 'hospital') {
      score += 30;
    } else if (place.type === 'public_place') {
      score += 20;
    }

    // 3. Open Status Factor
    if (place.isOpen === true) {
      score += 20;
    } else if (place.isOpen === false) {
      score -= 30;
    }

    // 4. Estimated Activity Level Factor
    if (place.estimated_activity === 'HIGH') {
      score += 10;
    } else if (place.estimated_activity === 'MEDIUM') {
      score += 5;
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    return {
      ...place,
      ranking_score: finalScore,
    };
  });

  // Sort descending by ranking score; tiebreak by shortest distance
  scored.sort((a, b) => {
    if ((b.ranking_score ?? 0) !== (a.ranking_score ?? 0)) {
      return (b.ranking_score ?? 0) - (a.ranking_score ?? 0);
    }
    return a.distanceMeters - b.distanceMeters;
  });

  return {
    recommended_place: scored[0],
    ranked_places: scored,
    advisory_notice:
      'Recommended refuge destination ranked based on proximity, facility type, and estimated activity level. Does not represent a guarantee of personal safety.',
  };
}

/**
 * Calculates turn-by-turn or polyline directions from the user's current
 * GPS location to a selected nearby assistance place.
 *
 * @param currentLocation Current user location
 * @param place Destination assistance place
 * @param travelMode 'pedestrian' (default) or 'car'
 */
export async function getDirectionsToAssistancePlace(
  currentLocation: LatLng,
  place: NearbyAssistancePlace,
  travelMode: 'pedestrian' | 'car' = 'pedestrian'
): Promise<DirectionsToPlaceResult> {
  const directDistance = Math.round(
    calculateHaversineDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      place.latitude,
      place.longitude
    )
  );

  const routeResult = await calculateRoutes({
    origin: currentLocation,
    destination: { latitude: place.latitude, longitude: place.longitude },
    travelMode,
    maxAlternatives: 1,
  });

  return {
    destination: place,
    route: routeResult,
    directDistanceMeters: directDistance,
  };
}
