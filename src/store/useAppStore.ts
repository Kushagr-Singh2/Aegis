/**
 * AEGIS App Store — Zustand
 *
 * Global app state: onboarding, user, permissions, trusted contacts CRUD, settings.
 *
 * Backend integration: replace mock values with real auth/user API.
 */

import { create } from 'zustand';
import {
  MOCK_USER,
  MOCK_TRUSTED_CONTACTS,
  type MockUser,
  type TrustedContact,
} from '../lib/mockData';

// ── Types ────────────────────────────────────────────────────────────────────

export type AppStatus = 'loading' | 'onboarding' | 'ready';
export type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'unavailable';

export type AppPermissions = {
  location: PermissionStatus;
  notifications: PermissionStatus;
  contacts: PermissionStatus;
};

export type EmergencyPreferences = {
  countdownSeconds: number;
  autoShareLocation: boolean;
  hapticFeedback: boolean;
};

export type JourneySettings = {
  checkInIntervalMinutes: number;
  deviationSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type AppState = {
  // App lifecycle
  status: AppStatus;
  isFirstLaunch: boolean;
  onboardingComplete: boolean;

  // User
  user: MockUser | null;
  isAuthenticated: boolean;

  // Trusted Contacts (Phase 4 CRUD)
  trustedContacts: TrustedContact[];

  // Preferences & Settings (Phase 4)
  emergencyPreferences: EmergencyPreferences;
  journeySettings: JourneySettings;

  // Permissions
  permissions: AppPermissions;

  // UI state
  isLoading: boolean;
  errorMessage: string | null;

  // Actions
  completeOnboarding: () => void;
  setUser: (user: MockUser | null) => void;
  updateUser: (updates: Partial<MockUser>) => void;
  setPermission: (key: keyof AppPermissions, status: PermissionStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  initializeApp: () => Promise<void>;

  // Trusted Contacts CRUD
  addContact: (contact: {
    name: string;
    phone: string;
    relationship: string;
    isEmergencyContact: boolean;
  }) => void;
  updateContact: (id: string, updated: Partial<TrustedContact>) => void;
  deleteContact: (id: string) => void;

  // Settings Actions
  updateEmergencyPreferences: (updates: Partial<EmergencyPreferences>) => void;
  updateJourneySettings: (updates: Partial<JourneySettings>) => void;
};

// ── Helper to derive avatar initials ─────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()((set) => ({
  status: 'loading',
  isFirstLaunch: false,
  onboardingComplete: true,

  user: MOCK_USER,
  isAuthenticated: true,

  trustedContacts: MOCK_TRUSTED_CONTACTS,

  emergencyPreferences: {
    countdownSeconds: 3,
    autoShareLocation: true,
    hapticFeedback: true,
  },

  journeySettings: {
    checkInIntervalMinutes: 15,
    deviationSensitivity: 'MEDIUM',
  },

  permissions: {
    location: 'unknown',
    notifications: 'unknown',
    contacts: 'unknown',
  },

  isLoading: false,
  errorMessage: null,

  completeOnboarding: () => {
    console.log('[AppStore] Onboarding complete');
    set({ onboardingComplete: true, status: 'ready' });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: user !== null });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },

  setPermission: (key, status) => {
    set((state) => ({
      permissions: { ...state.permissions, [key]: status },
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (message) => set({ errorMessage: message }),

  initializeApp: async () => {
    console.log('[AppStore] Initializing app...');
    set({ status: 'loading', isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 400));
    set({ status: 'ready', isLoading: false });
    console.log('[AppStore] App ready');
  },

  // ── Trusted Contacts CRUD ──────────────────────────────────────────────────

  addContact: (contactData) => {
    const newContact: TrustedContact = {
      id: `con_${Date.now()}`,
      name: contactData.name,
      phone: contactData.phone,
      relationship: contactData.relationship,
      avatarInitials: getInitials(contactData.name),
      isEmergencyContact: contactData.isEmergencyContact,
    };
    console.log('[AppStore] Adding contact:', newContact.name);
    set((state) => ({
      trustedContacts: [newContact, ...state.trustedContacts],
    }));
  },

  updateContact: (id, updated) => {
    console.log('[AppStore] Updating contact:', id);
    set((state) => ({
      trustedContacts: state.trustedContacts.map((c) => {
        if (c.id !== id) return c;
        const newName = updated.name ?? c.name;
        return {
          ...c,
          ...updated,
          avatarInitials: getInitials(newName),
        };
      }),
    }));
  },

  deleteContact: (id) => {
    console.log('[AppStore] Deleting contact:', id);
    set((state) => ({
      trustedContacts: state.trustedContacts.filter((c) => c.id !== id),
    }));
  },

  // ── Preferences & Settings ─────────────────────────────────────────────────

  updateEmergencyPreferences: (updates) => {
    set((state) => ({
      emergencyPreferences: { ...state.emergencyPreferences, ...updates },
    }));
  },

  updateJourneySettings: (updates) => {
    set((state) => ({
      journeySettings: { ...state.journeySettings, ...updates },
    }));
  },
}));
