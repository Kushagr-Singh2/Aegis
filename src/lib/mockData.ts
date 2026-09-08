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
