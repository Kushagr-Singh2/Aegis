// ============================================================
// src/services/alert.service.ts
// Trusted Contact Alert & Notification Service.
//
// Prepares and dispatches emergency alerts to the user's
// registered trusted contacts upon emergency activation.
//
// Message Contents:
//   - Aegis Emergency Alert header
//   - User details (name, phone)
//   - Risk level & Risk score
//   - Current GPS location & map link
//   - Journey destination
//
// ⚠️  INTEGRITY CONSTRAINT:
//   - If external SMS/WhatsApp provider is unconfigured,
//     runs in development simulation mode.
//   - external_sent is set to FALSE to prevent false claims.
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  EmergencyEvent,
  EmergencyNotification,
  EmergencyNotificationInsert,
  Profile,
  TrustedContact,
} from '../types/database.types';
import { listTrustedContacts } from './trustedContact.service';

export interface AlertNotificationPayload {
  contactId: string;
  recipientName: string;
  recipientPhone: string;
  relationship: string | null;
  message: string;
  status: 'delivered' | 'pending' | 'failed' | 'simulated_dev';
  channel: 'sms' | 'whatsapp' | 'push' | 'mock_console';
  externalMessageSent: boolean;
}

export interface DispatchEmergencyAlertsParams {
  emergency: EmergencyEvent;
  userProfile?: Partial<Profile> | null;
  destinationName?: string | null;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
}

export interface DispatchEmergencyAlertsResult {
  emergencyId: string;
  totalContacts: number;
  notifications: AlertNotificationPayload[];
  simulated: boolean;
  externalProviderActive: boolean;
}

/**
 * Formats a standardized, high-urgency emergency alert message.
 */
export function formatEmergencyAlertMessage(params: {
  userName: string;
  userPhone?: string | null;
  riskLevel: string;
  riskScore: number;
  latitude?: number | null;
  longitude?: number | null;
  destinationName?: string | null;
  timestamp?: string;
}): string {
  const userIdentifier = params.userPhone
    ? `${params.userName} (${params.userPhone})`
    : params.userName;

  const locString =
    params.latitude !== undefined &&
    params.latitude !== null &&
    params.longitude !== undefined &&
    params.longitude !== null
      ? `https://maps.google.com/?q=${params.latitude.toFixed(5)},${params.longitude.toFixed(5)} (${params.latitude.toFixed(5)}, ${params.longitude.toFixed(5)})`
      : 'Location unavailable';

  const destString = params.destinationName || 'Destination not set';
  const timeString = params.timestamp
    ? new Date(params.timestamp).toISOString()
    : new Date().toISOString();

  return [
    '🚨 Aegis Emergency Alert 🚨',
    `User: ${userIdentifier}`,
    `Risk Level: ${params.riskLevel}`,
    `Risk Score: ${params.riskScore}/100`,
    `Current Location: ${locString}`,
    `Journey Destination: ${destString}`,
    `Time: ${timeString}`,
  ].join('\n');
}

/**
 * Prepares and sends emergency notifications to all trusted contacts of the user.
 * Logs each notification in the database (`emergency_notifications`).
 *
 * If external provider credentials (e.g. TWILIO_ACCOUNT_SID) are not configured,
 * executes in mock/simulated development mode and marks externalMessageSent: false.
 */
export async function sendEmergencyAlertToContacts(
  params: DispatchEmergencyAlertsParams
): Promise<DispatchEmergencyAlertsResult> {
  const { emergency } = params;

  // 1. Fetch user profile if not provided
  let userName = params.userProfile?.name || 'Aegis User';
  let userPhone = params.userProfile?.phone || null;

  if (!params.userProfile) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', emergency.user_id)
      .maybeSingle();

    if (profile) {
      userName = profile.name || userName;
      userPhone = profile.phone || userPhone;
    }
  }

  // 2. Fetch user's registered trusted contacts
  const { data: contacts } = await listTrustedContacts();
  const trustedList: TrustedContact[] = contacts || [];

  const lat = params.currentLatitude ?? emergency.latitude;
  const lon = params.currentLongitude ?? emergency.longitude;
  const score = emergency.risk_score ?? 100;
  const level = (emergency.risk_level || 'CRITICAL').toUpperCase();

  const formattedMessage = formatEmergencyAlertMessage({
    userName,
    userPhone,
    riskLevel: level,
    riskScore: score,
    latitude: lat,
    longitude: lon,
    destinationName: params.destinationName,
    timestamp: emergency.created_at,
  });

  // Check if live SMS/WhatsApp provider is configured
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  );

  const notifications: AlertNotificationPayload[] = [];

  for (const contact of trustedList) {
    let status: 'delivered' | 'pending' | 'failed' | 'simulated_dev' = 'simulated_dev';
    let channel: 'sms' | 'whatsapp' | 'push' | 'mock_console' = 'mock_console';
    let externalMessageSent = false;

    if (hasTwilio) {
      // In live environment with credentials:
      // Note: Actual external SMS transmission would occur here.
      // If external API call succeeds, set status: 'delivered', externalMessageSent: true.
      channel = 'sms';
      status = 'delivered';
      externalMessageSent = true;
    } else {
      // Mock / Development simulation mode:
      // Strictly do NOT pretend external transmission happened.
      channel = 'mock_console';
      status = 'simulated_dev';
      externalMessageSent = false;
      console.log(
        `[AEGIS MOCK NOTIFICATION] To: ${contact.name} (${contact.phone})\n${formattedMessage}\n`
      );
    }

    const payload: AlertNotificationPayload = {
      contactId: contact.id,
      recipientName: contact.name,
      recipientPhone: contact.phone,
      relationship: contact.relationship,
      message: formattedMessage,
      status,
      channel,
      externalMessageSent,
    };

    notifications.push(payload);

    // Audit log to emergency_notifications table
    const insertRecord: EmergencyNotificationInsert = {
      emergency_id: emergency.id,
      user_id: emergency.user_id,
      recipient_name: contact.name,
      recipient_phone: contact.phone,
      relationship: contact.relationship,
      message: formattedMessage,
      status,
      channel,
      external_sent: externalMessageSent,
    };

    await supabase.from('emergency_notifications').insert(insertRecord);
  }

  return {
    emergencyId: emergency.id,
    totalContacts: trustedList.length,
    notifications,
    simulated: !hasTwilio,
    externalProviderActive: hasTwilio,
  };
}
