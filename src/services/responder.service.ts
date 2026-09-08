// ============================================================
// src/services/responder.service.ts
// Emergency Responder Data Access & 112 Dispatch Information.
//
// Features:
//   1. Emergency 112 Dial Payload: Provides Android ACTION_DIAL intent
//      data and spoken dispatch briefing script for 112 operators.
//      (Does NOT simulate or fake a police dispatch system).
//   2. Secure Responder Emergency Dossier: Compiles user, journey,
//      risk telemetry, GPS location, route, nearby assistance, and
//      AI situation summary for emergency responders.
//   3. Live Realtime Responder Subscription.
// ============================================================

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  EmergencyEvent,
  Journey,
  LocationUpdate,
  Profile,
} from '../types/database.types';
import { explainMySituation, type ExplainSituationResult } from './aiSummary.service';
import {
  type NearbyAssistancePlace,
  searchNearbyAssistance,
} from './nearbyPlaces.service';


export interface EmergencyDialPayload {
  dialNumber: '112';
  dialUri: 'tel:112';
  androidIntentAction: 'android.intent.action.DIAL';
  user: {
    name: string;
    phone: string | null;
  };
  location: {
    latitude: number;
    longitude: number;
    formattedCoordinates: string;
    mapLink: string;
  };
  destinationName: string | null;
  /** Prepared statement for the user to read to the 112 dispatcher */
  spokenBriefingScript: string;
  nearestPoliceStation?: {
    name: string;
    address: string;
    distanceMeters: number;
  } | null;
}

export interface ResponderEmergencyDossier {
  emergency: EmergencyEvent;
  user: {
    id: string;
    name: string;
    phone: string | null;
    email: string;
  };
  journey: Journey | null;
  risk: {
    score: number;
    level: string;
    triggerType: string;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
    timestamp: string;
  };
  routeGeometry: any | null;
  nearbyAssistance: {
    police: NearbyAssistancePlace[];
    hospitals: NearbyAssistancePlace[];
    publicRefuges: NearbyAssistancePlace[];
    nearestRefuge: NearbyAssistancePlace | null;
  };
  situationSummary: ExplainSituationResult;
}

/**
 * Prepares the payload for the Android client to trigger ACTION_DIAL with tel:112.
 * Includes a prepared statement for the caller to speak directly to 112 dispatchers.
 */
export async function getEmergencyDialPayload(params: {
  userName: string;
  userPhone?: string | null;
  latitude: number;
  longitude: number;
  destinationName?: string | null;
}): Promise<EmergencyDialPayload> {
  const coordString = `${params.latitude.toFixed(5)}, ${params.longitude.toFixed(5)}`;
  const mapLink = `https://maps.google.com/?q=${params.latitude.toFixed(5)},${params.longitude.toFixed(5)}`;

  // Find nearest police station if available
  let nearestPolice: { name: string; address: string; distanceMeters: number } | null = null;
  try {
    const nearby = await searchNearbyAssistance({
      latitude: params.latitude,
      longitude: params.longitude,
      radiusMeters: 3000,
      categories: ['police'],
    });
    if (nearby.places.length > 0) {
      nearestPolice = {
        name: nearby.places[0].name,
        address: nearby.places[0].address,
        distanceMeters: nearby.places[0].distanceMeters,
      };
    }
  } catch {}

  const destContext = params.destinationName
    ? ` en route to ${params.destinationName}`
    : '';

  const spokenScript = [
    `My name is ${params.userName}. I am in an emergency situation${destContext}.`,
    `My GPS coordinates are latitude ${params.latitude.toFixed(4)}, longitude ${params.longitude.toFixed(4)}.`,
    nearestPolice
      ? `I am approximately ${nearestPolice.distanceMeters} metres from ${nearestPolice.name}.`
      : '',
    'Please send emergency assistance immediately.',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    dialNumber: '112',
    dialUri: 'tel:112',
    androidIntentAction: 'android.intent.action.DIAL',
    user: {
      name: params.userName,
      phone: params.userPhone ?? null,
    },
    location: {
      latitude: params.latitude,
      longitude: params.longitude,
      formattedCoordinates: coordString,
      mapLink,
    },
    destinationName: params.destinationName ?? null,
    spokenBriefingScript: spokenScript,
    nearestPoliceStation: nearestPolice,
  };
}

/**
 * Securely compiles active emergency information for authorized responders.
 *
 * Includes:
 *   - User profile
 *   - Journey details & route geometry
 *   - Risk score & trigger
 *   - Current location
 *   - Nearby assistance facilities
 *   - AI situation summary
 */
export async function getResponderEmergencyDetails(
  emergencyId: string
): Promise<{ data: ResponderEmergencyDossier | null; error: unknown }> {
  try {
    // 1. Fetch emergency event
    const { data: emergency, error: emError } = await supabase
      .from('emergency_events')
      .select('*')
      .eq('id', emergencyId)
      .single();

    if (emError || !emergency) {
      return { data: null, error: emError ?? new Error('Emergency event not found') };
    }

    // 2. Fetch user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', emergency.user_id)
      .maybeSingle();

    // 3. Fetch journey if associated
    let journey: Journey | null = null;
    if (emergency.journey_id) {
      const { data: jData } = await supabase
        .from('journeys')
        .select('*')
        .eq('id', emergency.journey_id)
        .maybeSingle();
      journey = jData;
    }

    // 4. Fetch latest GPS coordinate
    let currentLat = emergency.latitude ?? 0;
    let currentLon = emergency.longitude ?? 0;
    let accuracy: number | null = null;
    let lastPingTime = emergency.created_at;

    if (emergency.journey_id) {
      const { data: latestLoc } = await supabase
        .from('location_updates')
        .select('*')
        .eq('journey_id', emergency.journey_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestLoc) {
        currentLat = latestLoc.latitude;
        currentLon = latestLoc.longitude;
        accuracy = latestLoc.accuracy;
        lastPingTime = latestLoc.created_at;
      }
    }

    // 5. Search nearby assistance places around the emergency coordinate
    const nearby = await searchNearbyAssistance({
      latitude: currentLat,
      longitude: currentLon,
      radiusMeters: 5000,
    });

    const policeList = nearby.places.filter((p) => p.type === 'police');
    const hospitalList = nearby.places.filter((p) => p.type === 'hospital');
    const publicList = nearby.places.filter((p) => p.type === 'public_place');

    const nearestPolice = policeList[0] || null;

    // 6. Generate AI Situation Summary
    const situationSummary = await explainMySituation({
      journey: journey ? {
        id: journey.id,
        destination_name: journey.destination_name,
        status: journey.status,
        started_at: journey.started_at,
      } : null,
      currentLocation: { latitude: currentLat, longitude: currentLon },
      riskScore: emergency.risk_score ?? 100,
      riskLevel: (emergency.risk_level || 'CRITICAL').toUpperCase() as any,
      emergencyTrigger: emergency.trigger_type,
      nearestAssistance: nearestPolice ? {
        name: nearestPolice.name,
        type: 'police',
        distanceMeters: nearestPolice.distanceMeters,
      } : null,
    });

    const dossier: ResponderEmergencyDossier = {
      emergency,
      user: {
        id: emergency.user_id,
        name: userProfile?.name || 'Aegis User',
        phone: userProfile?.phone || null,
        email: userProfile?.email || '',
      },
      journey,
      risk: {
        score: emergency.risk_score ?? 100,
        level: (emergency.risk_level || 'CRITICAL').toUpperCase(),
        triggerType: emergency.trigger_type,
      },
      currentLocation: {
        latitude: currentLat,
        longitude: currentLon,
        accuracy,
        timestamp: lastPingTime,
      },
      routeGeometry: journey?.route_data ?? null,
      nearbyAssistance: {
        police: policeList,
        hospitals: hospitalList,
        publicRefuges: publicList,
        nearestRefuge: nearby.places[0] ?? null,
      },
      situationSummary,
    };

    return { data: dossier, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Subscribes to live emergency events via Supabase Realtime for responder dispatchers.
 */
export function subscribeToResponderAlerts(
  onAlert: (event: EmergencyEvent) => void
): () => void {
  const channel: RealtimeChannel = supabase
    .channel('responder:emergency_events')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'emergency_events',
      },
      (payload) => {
        onAlert(payload.new as EmergencyEvent);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
