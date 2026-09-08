// ============================================================
// src/services/profile.service.ts
// CRUD for the authenticated user's profile.
// ============================================================

import { supabase } from '../lib/supabase';
import type { Profile, ProfileUpdate } from '../types/database.types';


// ── Read ─────────────────────────────────────────────────────

/**
 * Fetches the profile for the currently logged-in user.
 */
export async function getProfile(): Promise<{ data: Profile | null; error: unknown }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { data, error };
}

// ── Update ───────────────────────────────────────────────────

/**
 * Updates the current user's profile fields.
 * Only `name`, `phone`, and `email` can be changed here.
 */
export async function updateProfile(
  updates: ProfileUpdate
): Promise<{ data: Profile | null; error: unknown }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  return { data, error };
}
