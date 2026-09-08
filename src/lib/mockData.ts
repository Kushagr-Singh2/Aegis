/**
 * AEGIS Mock Data
 *
 * Realistic placeholder data for development.
 * Replace with real API calls in backend integration phase.
 */

export type TrustedContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  avatarInitials: string;
  isEmergencyContact: boolean;
};

export type JourneyCheckpoint = {
  id: string;
  label: string;
  timestamp: string;
  status: 'passed' | 'current' | 'upcoming';
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
  safeWord: string;
};

// ── Mock User ────────────────────────────────────────────────────────────────

export const MOCK_USER: MockUser = {
  id: 'usr_001',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  phone: '+91 98765 43210',
  avatarInitials: 'PS',
  safeWord: 'LOTUS',
};

// ── Trusted Contacts ─────────────────────────────────────────────────────────

export const MOCK_TRUSTED_CONTACTS: TrustedContact[] = [
  {
    id: 'con_001',
    name: 'Aarav Sharma',
    phone: '+91 98100 11111',
    relationship: 'Brother',
    avatarInitials: 'AS',
    isEmergencyContact: true,
  },
  {
    id: 'con_002',
    name: 'Meera Patel',
    phone: '+91 99200 22222',
    relationship: 'Best Friend',
    avatarInitials: 'MP',
    isEmergencyContact: true,
  },
  {
    id: 'con_003',
    name: 'Rohit Kumar',
    phone: '+91 97300 33333',
    relationship: 'Colleague',
    avatarInitials: 'RK',
    isEmergencyContact: false,
  },
  {
    id: 'con_004',
    name: 'Sunita Sharma',
    phone: '+91 96400 44444',
    relationship: 'Mother',
    avatarInitials: 'SS',
    isEmergencyContact: true,
  },
];

// ── Destination Suggestions ──────────────────────────────────────────────────

export const MOCK_RECENT_SHORTCUTS = [
  {
    id: 'recent_home',
    title: 'Home',
    subtitle: 'Sector 62, Noida, UP',
    icon: 'home-outline' as const,
    distance: '14.2 km',
    estimatedTime: '35 min',
  },
  {
    id: 'recent_college',
    title: 'College',
    subtitle: 'North Campus, University Enclave',
    icon: 'school-outline' as const,
    distance: '8.4 km',
    estimatedTime: '22 min',
  },
  {
    id: 'recent_work',
    title: 'Work',
    subtitle: 'Cyber City, Phase II, Gurugram',
    icon: 'briefcase-outline' as const,
    distance: '18.6 km',
    estimatedTime: '42 min',
  },
];

export const MOCK_DESTINATIONS = [
  {
    id: 'dest_001',
    name: 'Connaught Place Metro',
    address: 'Connaught Place, New Delhi, 110001',
    distance: '3.2 km',
    estimatedTime: '12 min',
  },
  {
    id: 'dest_002',
    name: 'Hauz Khas Village',
    address: 'Hauz Khas, South Delhi, 110016',
    distance: '7.8 km',
    estimatedTime: '28 min',
  },
  {
    id: 'dest_003',
    name: 'Saket Mall',
    address: 'Saket District Centre, New Delhi, 110017',
    distance: '5.1 km',
    estimatedTime: '19 min',
  },
  {
    id: 'dest_004',
    name: 'India Gate',
    address: 'Rajpath, New Delhi, 110001',
    distance: '4.4 km',
    estimatedTime: '16 min',
  },
  {
    id: 'dest_005',
    name: 'Lajpat Nagar Market',
    address: 'Lajpat Nagar II, New Delhi, 110024',
    distance: '6.0 km',
    estimatedTime: '22 min',
  },
];



// ── Journey Checkpoints (for active journey mock) ────────────────────────────

export const MOCK_JOURNEY_CHECKPOINTS: JourneyCheckpoint[] = [
  {
    id: 'chk_001',
    label: 'Journey Started',
    timestamp: '10:30 AM',
    status: 'passed',
  },
  {
    id: 'chk_002',
    label: 'Route Deviation Check',
    timestamp: '10:45 AM',
    status: 'current',
  },
  {
    id: 'chk_003',
    label: 'Midpoint Safety Check',
    timestamp: '11:00 AM',
    status: 'upcoming',
  },
  {
    id: 'chk_004',
    label: 'Destination',
    timestamp: '11:15 AM',
    status: 'upcoming',
  },
];

// ── Recent Journeys (for History) ────────────────────────────────────────────

export const MOCK_RECENT_JOURNEYS = [
  {
    id: 'jrn_001',
    destination: 'Connaught Place Metro',
    date: 'Today, 8:45 AM',
    duration: '18 min',
    status: 'completed' as const,
    riskPeak: 'low' as const,
  },
  {
    id: 'jrn_002',
    destination: 'Lajpat Nagar Market',
    date: 'Yesterday, 7:30 PM',
    duration: '25 min',
    status: 'completed' as const,
    riskPeak: 'medium' as const,
  },
  {
    id: 'jrn_003',
    destination: 'Hauz Khas Village',
    date: 'Sep 6, 9:15 PM',
    duration: '31 min',
    status: 'completed' as const,
    riskPeak: 'low' as const,
  },
];

// ── Safety Tips ──────────────────────────────────────────────────────────────

export const MOCK_SAFETY_TIPS = [
  'Stay on well-lit, populated streets when possible.',
  'Share your journey with trusted contacts before leaving.',
  'Keep your phone charged before long journeys.',
  'Trust your instincts — if something feels wrong, seek help.',
  'Know the local emergency number: 112 (India).',
];

// ── Mock Routes (Phase 2) ─────────────────────────────────────────────────────

export type MockRoute = {
  id: string;
  label: string;     // "Route A", "Route B", "Route C"
  eta: string;       // "20 min"
  etaMinutes: number;
  distance: string;  // "8.2 km"
  distanceKm: number;
  traffic: 'Heavy' | 'Moderate' | 'Low';
  safetyRating: 'Moderate' | 'Good' | 'Best';
  isRecommended: boolean;
  recommendedReason?: string;
  // Mock polyline — percentage positions for the visual route line
  waypoints: Array<{ x: number; y: number }>;
};

export const MOCK_ROUTES: MockRoute[] = [
  {
    id: 'route_a',
    label: 'Route A',
    eta: '20 min',
    etaMinutes: 20,
    distance: '6.8 km',
    distanceKm: 6.8,
    traffic: 'Heavy',
    safetyRating: 'Moderate',
    isRecommended: false,
    waypoints: [
      { x: 0.18, y: 0.82 },
      { x: 0.22, y: 0.62 },
      { x: 0.42, y: 0.52 },
      { x: 0.58, y: 0.38 },
      { x: 0.78, y: 0.22 },
    ],
  },
  {
    id: 'route_b',
    label: 'Route B',
    eta: '24 min',
    etaMinutes: 24,
    distance: '8.2 km',
    distanceKm: 8.2,
    traffic: 'Low',
    safetyRating: 'Best',
    isRecommended: true,
    recommendedReason: 'Recommended safer route',
    waypoints: [
      { x: 0.18, y: 0.82 },
      { x: 0.15, y: 0.58 },
      { x: 0.28, y: 0.40 },
      { x: 0.55, y: 0.28 },
      { x: 0.78, y: 0.22 },
    ],
  },
  {
    id: 'route_c',
    label: 'Route C',
    eta: '27 min',
    etaMinutes: 27,
    distance: '9.5 km',
    distanceKm: 9.5,
    traffic: 'Low',
    safetyRating: 'Good',
    isRecommended: false,
    waypoints: [
      { x: 0.18, y: 0.82 },
      { x: 0.30, y: 0.72 },
      { x: 0.48, y: 0.65 },
      { x: 0.62, y: 0.44 },
      { x: 0.78, y: 0.22 },
    ],
  },
];

// ── Favourite Destinations (Phase 2) ─────────────────────────────────────────

export type FavouriteDestination = {
  id: string;
  name: string;
  address: string;
  icon: string;
  distance: string;
  estimatedTime: string;
};

export const MOCK_FAVOURITE_DESTINATIONS: FavouriteDestination[] = [
  {
    id: 'fav_001',
    name: 'Home',
    address: 'Sector 62, Noida, UP',
    icon: 'home',
    distance: '14.2 km',
    estimatedTime: '35 min',
  },
  {
    id: 'fav_002',
    name: 'College',
    address: 'North Campus, University Enclave',
    icon: 'school',
    distance: '8.4 km',
    estimatedTime: '22 min',
  },
  {
    id: 'fav_003',
    name: 'Work',
    address: 'Cyber City, Phase II, Gurugram',
    icon: 'briefcase',
    distance: '18.6 km',
    estimatedTime: '42 min',
  },
];

// ── Suggested Destinations (Phase 2) ─────────────────────────────────────────

export type SuggestedDestination = {
  id: string;
  name: string;
  address: string;
  distance: string;
  estimatedTime: string;
  reason: string; // "Based on your routine", "Popular nearby", etc.
};

export const MOCK_SUGGESTED_DESTINATIONS: SuggestedDestination[] = [
  {
    id: 'sug_001',
    name: 'Connaught Place Metro',
    address: 'Connaught Place, New Delhi, 110001',
    distance: '3.2 km',
    estimatedTime: '12 min',
    reason: 'Based on your routine',
  },
  {
    id: 'sug_002',
    name: 'Hauz Khas Village',
    address: 'Hauz Khas, South Delhi, 110016',
    distance: '7.8 km',
    estimatedTime: '28 min',
    reason: 'Popular nearby',
  },
  {
    id: 'sug_003',
    name: 'Lajpat Nagar Market',
    address: 'Lajpat Nagar II, New Delhi, 110024',
    distance: '6.0 km',
    estimatedTime: '22 min',
    reason: 'Visited last week',
  },
  {
    id: 'sug_004',
    name: 'India Gate',
    address: 'Rajpath, New Delhi, 110001',
    distance: '4.4 km',
    estimatedTime: '16 min',
    reason: 'Popular nearby',
  },
];

// ── Safety Scenarios (Phase 2 — DEV only) ────────────────────────────────────

export type SafetyScenario = 'normal' | 'route_deviation' | 'motion_anomaly' | 'missed_checkin' | 'critical';

export type SafetyScenarioConfig = {
  key: SafetyScenario;
  label: string;
  statusPill: string;
  statusEmoji: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskLabel: string;
};

export const MOCK_SAFETY_SCENARIOS: SafetyScenarioConfig[] = [
  {
    key: 'normal',
    label: 'Normal',
    statusPill: "You're on route",
    statusEmoji: '🟢',
    riskLevel: 'low',
    riskLabel: 'LOW RISK',
  },
  {
    key: 'route_deviation',
    label: 'Route Deviation',
    statusPill: 'Route deviation detected',
    statusEmoji: '🟡',
    riskLevel: 'moderate',
    riskLabel: 'MODERATE RISK',
  },
  {
    key: 'motion_anomaly',
    label: 'Motion Anomaly',
    statusPill: 'Motion anomaly detected',
    statusEmoji: '🟡',
    riskLevel: 'moderate',
    riskLabel: 'MODERATE RISK',
  },
  {
    key: 'missed_checkin',
    label: 'Missed Check-in',
    statusPill: 'Missed check-in',
    statusEmoji: '🔴',
    riskLevel: 'high',
    riskLabel: 'HIGH RISK',
  },
  {
    key: 'critical',
    label: 'Critical',
    statusPill: 'CRITICAL — SOS ready',
    statusEmoji: '🔴',
    riskLevel: 'critical',
    riskLabel: 'CRITICAL RISK',
  },
];

// ── Phase 4: Nearby Help & Safe Destinations ─────────────────────────────────

export type ActivityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type NearbyHelpPlace = {
  id: string;
  name: string;
  category: 'recommended' | 'police' | 'hospital' | 'public_place';
  distance: string;
  walkingEta: string;
  direction: string; // e.g. "↗ NE", "→ E", "↖ NW"
  isOpen?: boolean;
  openStatusText?: string;
  estimatedActivity?: ActivityLevel;
  isRecommended?: boolean;
  phone?: string;
  address: string;
  coordinates: { x: number; y: number };
};

export const MOCK_NEARBY_HELP_PLACES: NearbyHelpPlace[] = [
  {
    id: 'place_mall',
    name: 'Shopping Mall',
    category: 'recommended',
    distance: '350m',
    walkingEta: '5 min walk',
    direction: '↗ NE',
    estimatedActivity: 'HIGH',
    isRecommended: true,
    isOpen: true,
    openStatusText: 'Open until 11:00 PM',
    address: 'City Centre Mall, Inner Circle',
    coordinates: { x: 0.72, y: 0.35 },
  },
  {
    id: 'place_police',
    name: 'Police Station',
    category: 'police',
    distance: '800m',
    walkingEta: '10 min walk',
    direction: '↗ NE',
    isOpen: true,
    openStatusText: 'Open 24/7',
    phone: '112',
    address: 'Connaught Place Police Station, Block B',
    coordinates: { x: 0.85, y: 0.20 },
  },
  {
    id: 'place_hospital',
    name: 'Hospital',
    category: 'hospital',
    distance: '1.2km',
    walkingEta: '14 min walk',
    direction: '→ E',
    isOpen: true,
    openStatusText: 'Open 24/7 Emergency',
    phone: '102',
    address: 'Ram Manohar Lohia Hospital, Emergency Wing',
    coordinates: { x: 0.90, y: 0.65 },
  },
  {
    id: 'place_metro',
    name: 'Metro Station Plaza',
    category: 'public_place',
    distance: '450m',
    walkingEta: '6 min walk',
    direction: '↖ NW',
    estimatedActivity: 'MEDIUM',
    isOpen: true,
    openStatusText: 'Open with CISF security',
    address: 'Rajiv Chowk Metro Gate 4',
    coordinates: { x: 0.35, y: 0.25 },
  },
  {
    id: 'place_store',
    name: '24/7 Convenience Store',
    category: 'public_place',
    distance: '200m',
    walkingEta: '3 min walk',
    direction: '↓ S',
    estimatedActivity: 'LOW',
    isOpen: true,
    openStatusText: 'Well-lit frontage',
    address: 'Janpath Lane Market',
    coordinates: { x: 0.45, y: 0.75 },
  },
];

// ── Phase 4: Voice SOS ────────────────────────────────────────────────────────

export type VoiceSOSState =
  | 'IDLE'
  | 'LISTENING'
  | 'DETECTED'
  | 'CONFIRMATION'
  | 'ACTIVATED'
  | 'CANCELLED'
  | 'UNAVAILABLE';

export const VOICE_SOS_PHRASES = ['Help me', 'Emergency', 'SOS'];

// ── Phase 4: Explain My Situation ───────────────────────────────────────────

export type EmergencyTimelineEvent = {
  id: string;
  time: string;
  title: string;
  description: string;
  status: 'passed' | 'alert' | 'critical';
};

export const MOCK_SITUATION_EXPLANATION = {
  summary:
    'High-risk journey detected. The user moved approximately 180 metres away from the planned route and missed a safety check-in. Abnormal movement was detected afterward. Current risk score is 87/100.',
  parameters: {
    risk: '87 / 100 CRITICAL',
    trigger: 'Route deviation (180m) & Missed check-in',
    location: 'Connaught Place Outer Ring, New Delhi',
    nearestPolice: 'Connaught Place Police Station (800m)',
    nearestHospital: 'Ram Manohar Lohia Hospital (1.2km)',
  },
  timeline: [
    {
      id: 'evt_1',
      time: '10:30 PM',
      title: 'Journey Protection Active',
      description: 'Journey initiated toward Hauz Khas Village on Route B.',
      status: 'passed' as const,
    },
    {
      id: 'evt_2',
      time: '10:42 PM',
      title: 'Route Deviation Detected',
      description: 'Vehicle turned away from Route B (180m off corridor).',
      status: 'alert' as const,
    },
    {
      id: 'evt_3',
      time: '10:45 PM',
      title: 'Safety Check-In Missed',
      description: 'No response to 30s safety verification prompt.',
      status: 'alert' as const,
    },
    {
      id: 'evt_4',
      time: '10:47 PM',
      title: 'Motion Anomaly Detected',
      description: 'Unexpected prolonged stop in low-illumination sector.',
      status: 'alert' as const,
    },
    {
      id: 'evt_5',
      time: '10:48 PM',
      title: 'Manual SOS Confirmed',
      description: 'Emergency state activated. Contacts notified.',
      status: 'critical' as const,
    },
  ],
};
