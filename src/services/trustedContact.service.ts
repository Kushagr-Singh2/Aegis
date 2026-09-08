// ============================================================
// src/services/trustedContact.service.ts
// Manage the emergency contacts list for the current user.
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  TrustedContact,
  TrustedContactInsert,
  TrustedContactUpdate,
} from '../types/database.types';

// ── List ─────────────────────────────────────────────────────

/**
 * Returns all trusted contacts for the authenticated user,
 * ordered by creation date (oldest first).
 */
export async function listTrustedContacts(): Promise<{
  data: TrustedContact[];
  error: unknown;
}> {
  const { data, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .order('created_at', { ascending: true });

  return { data: data ?? [], error };
}

// ── Get single ───────────────────────────────────────────────

export async function getTrustedContact(id: string): Promise<{
  data: TrustedContact | null;
  error: unknown;
}> {
  const { data, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

// ── Create ───────────────────────────────────────────────────

/**
 * Adds a new trusted contact for the current user.
 * `user_id` is injected automatically from the auth context.
 */
export async function addTrustedContact(
  contact: Omit<TrustedContactInsert, 'user_id'>
): Promise<{ data: TrustedContact | null; error: unknown }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('trusted_contacts')
    .insert({ ...contact, user_id: user.id })
    .select()
    .single();

  return { data, error };
}

// ── Update ───────────────────────────────────────────────────

export async function updateTrustedContact(
  id: string,
  updates: TrustedContactUpdate
): Promise<{ data: TrustedContact | null; error: unknown }> {
  const { data, error } = await supabase
    .from('trusted_contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

// ── Delete ───────────────────────────────────────────────────

export async function deleteTrustedContact(
  id: string
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('trusted_contacts')
    .delete()
    .eq('id', id);

  return { error };
}
