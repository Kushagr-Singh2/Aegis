// ============================================================
// database.types.ts
// Hand-authored DB types matching the AEGIS schema.
// Run `npm run generate:types` after connecting to a live
// Supabase project to auto-regenerate from the actual schema.
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Row shapes ───────────────────────────────────────────────

export interface Profile {
  id: string;         // uuid — same as auth.users.id
  name: string;
  phone: string | null;
  email: string;
  created_at: string; // ISO-8601
}

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string | null;
  created_at: string;
}

export type JourneyStatus = 'planned' | 'active' | 'completed' | 'cancelled' | 'emergency';

export interface Journey {
  id: string;
  user_id: string;
  origin_lat: number | null;
  origin_lng: number | null;
  destination_lat: number | null;
  destination_lng: number | null;
  destination_name: string | null;
  route_data: Json | null;
  started_at: string | null;
  expected_arrival: string | null;
  ended_at: string | null;
  status: JourneyStatus;
  created_at: string;
}

export interface LocationUpdate {
  id: string;
  journey_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  created_at: string;
}

export type TriggerType =
  | 'manual'
  | 'manual_sos'
  | 'MANUAL_SOS'
  | 'voice_sos'
  | 'VOICE_SOS'
  | 'auto'
  | 'AUTO'
  | 'check_in_miss'
  | 'CHECK_IN_MISS'
  | 'geofence'
  | 'GEOFENCE';

export type RiskLevel =
  | 'low'
  | 'LOW'
  | 'moderate'
  | 'MODERATE'
  | 'medium'
  | 'MEDIUM'
  | 'high'
  | 'HIGH'
  | 'critical'
  | 'CRITICAL';

export type EmergencyStatus = 'active' | 'resolved' | 'false_alarm';

export interface EmergencyEvent {
  id: string;
  user_id: string;
  journey_id: string | null;
  trigger_type: TriggerType;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  latitude: number | null;
  longitude: number | null;
  status: EmergencyStatus;
  created_at: string;
  resolved_at: string | null;
}

export type CheckInStatus = 'pending' | 'responded' | 'missed';

export interface CheckIn {
  id: string;
  journey_id: string;
  scheduled_at: string;
  responded_at: string | null;
  status: CheckInStatus;
  created_at: string;
}

// ── Insert types (id / created_at are optional on write) ─────

export type ProfileInsert = Omit<Profile, 'id' | 'created_at'>;
export type ProfileUpdate = Partial<ProfileInsert>;

export type TrustedContactInsert = Omit<TrustedContact, 'id' | 'created_at'>;
export type TrustedContactUpdate = Partial<Omit<TrustedContactInsert, 'user_id'>>;

export type JourneyInsert = Omit<Journey, 'id' | 'created_at'>;
export type JourneyUpdate = Partial<Omit<JourneyInsert, 'user_id'>>;

export type LocationUpdateInsert = Omit<LocationUpdate, 'id' | 'created_at'>;

export type EmergencyEventInsert = Omit<EmergencyEvent, 'id' | 'created_at'>;
export type EmergencyEventUpdate = Partial<Pick<EmergencyEvent, 'status' | 'resolved_at' | 'risk_score' | 'risk_level'>>;

export type CheckInInsert = Omit<CheckIn, 'id' | 'created_at'>;
export type CheckInUpdate = Partial<Pick<CheckIn, 'status' | 'responded_at'>>;

// ── Database schema type (for typed Supabase client) ─────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert & { id: string };
        Update: ProfileUpdate;
      };
      trusted_contacts: {
        Row: TrustedContact;
        Insert: TrustedContactInsert;
        Update: TrustedContactUpdate;
      };
      journeys: {
        Row: Journey;
        Insert: JourneyInsert;
        Update: JourneyUpdate;
      };
      location_updates: {
        Row: LocationUpdate;
        Insert: LocationUpdateInsert;
        Update: never;
      };
      emergency_events: {
        Row: EmergencyEvent;
        Insert: EmergencyEventInsert;
        Update: EmergencyEventUpdate;
      };
      check_ins: {
        Row: CheckIn;
        Insert: CheckInInsert;
        Update: CheckInUpdate;
      };
      emergency_notifications: {
        Row: EmergencyNotification;
        Insert: EmergencyNotificationInsert;
        Update: EmergencyNotificationUpdate;
      };
    };
  };
}

export type NotificationStatus = 'delivered' | 'pending' | 'failed' | 'simulated_dev';
export type NotificationChannel = 'sms' | 'whatsapp' | 'push' | 'mock_console';

export interface EmergencyNotification {
  id: string;
  emergency_id: string;
  user_id: string;
  recipient_name: string;
  recipient_phone: string;
  relationship: string | null;
  message: string;
  status: NotificationStatus;
  channel: NotificationChannel;
  external_sent: boolean;
  created_at: string;
}

export type EmergencyNotificationInsert = Omit<EmergencyNotification, 'id' | 'created_at'>;
export type EmergencyNotificationUpdate = Partial<Pick<EmergencyNotification, 'status' | 'channel' | 'external_sent'>>;

