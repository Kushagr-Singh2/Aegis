// ============================================================
// src/services/auth.service.ts
// Supabase Auth — register, login, logout, session management.
// ============================================================

import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';


// ── Types ────────────────────────────────────────────────────

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface RegisterParams {
  email: string;
  password: string;
  name?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

// ── Register ─────────────────────────────────────────────────

/**
 * Creates a new Supabase Auth user.
 * The `handle_new_user` trigger in the DB automatically creates
 * the corresponding row in `public.profiles`.
 */
export async function register(params: RegisterParams): Promise<AuthResult> {
  const { email, password, name } = params;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // Stored in raw_user_meta_data; the DB trigger reads it.
        name: name ?? '',
      },
    },
  });

  return {
    user: data.user ?? null,
    session: data.session ?? null,
    error,
  };
}

// ── Login ────────────────────────────────────────────────────

/**
 * Signs in an existing user with email and password.
 * Returns the authenticated session.
 */
export async function login(params: LoginParams): Promise<AuthResult> {
  const { email, password } = params;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user ?? null,
    session: data.session ?? null,
    error,
  };
}

// ── Logout ───────────────────────────────────────────────────

/**
 * Signs the current user out and clears the persisted session.
 */
export async function logout(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ── Session ──────────────────────────────────────────────────

/**
 * Returns the current session from local storage / memory.
 * Does NOT make a network request; use `refreshSession` if you
 * need a guaranteed-fresh token.
 */
export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

/**
 * Returns the currently authenticated user (network call).
 */
export async function getUser(): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user ?? null, error };
}

/**
 * Forces a token refresh and returns the new session.
 */
export async function refreshSession(): Promise<AuthResult> {
  const { data, error } = await supabase.auth.refreshSession();
  return {
    user: data.user ?? null,
    session: data.session ?? null,
    error,
  };
}

// ── Auth state listener ───────────────────────────────────────

/**
 * Subscribes to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED…).
 * Returns an unsubscribe function — call it to clean up.
 *
 * @example
 * const unsub = onAuthStateChange((event, session) => {
 *   console.log(event, session?.user.id);
 * });
 * // later:
 * unsub();
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}
