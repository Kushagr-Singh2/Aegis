/**
 * AEGIS App Store — Zustand
 *
 * Global app state: onboarding, user, permissions, theme.
 *
 * Backend integration: replace mock values with real auth/user API.
 */

import { create } from 'zustand';
import { MOCK_USER, type MockUser } from '../lib/mockData';

// ── Types ────────────────────────────────────────────────────────────────────

export type AppStatus = 'loading' | 'onboarding' | 'ready';

export type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'unavailable';

export type AppPermissions = {
  location: PermissionStatus;
  notifications: PermissionStatus;
  contacts: PermissionStatus;
};

export type AppState = {
  // App lifecycle
  status: AppStatus;
  isFirstLaunch: boolean;
  onboardingComplete: boolean;

  // User (mock until auth integrated)
  user: MockUser | null;
  isAuthenticated: boolean;

  // Permissions
  permissions: AppPermissions;

  // UI state
  isLoading: boolean;
  errorMessage: string | null;

  // Actions
  completeOnboarding: () => void;
  setUser: (user: MockUser | null) => void;
  setPermission: (key: keyof AppPermissions, status: PermissionStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  initializeApp: () => Promise<void>;
};

// ── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()((set, _get) => ({
  // Initial state
  status: 'loading',
  isFirstLaunch: false,
  onboardingComplete: true, // TODO: read from AsyncStorage/SecureStore

  // Mock user — pre-authenticated for development
  user: MOCK_USER,
  isAuthenticated: true, // TODO: replace with real auth check

  permissions: {
    location: 'unknown',
    notifications: 'unknown',
    contacts: 'unknown',
  },

  isLoading: false,
  errorMessage: null,

  completeOnboarding: () => {
    console.log('[AppStore] Onboarding complete');
    set({
      onboardingComplete: true,
      status: 'ready',
    });
    // TODO (backend): save onboarding state to AsyncStorage
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: user !== null,
    });
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

    // Simulate brief initialization delay (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // TODO (backend): Check stored auth token
    // TODO (backend): Fetch user profile
    // TODO (permissions): Check existing permission statuses

    set({
      status: 'ready',
      isLoading: false,
    });
    console.log('[AppStore] App ready');
  },
}));
