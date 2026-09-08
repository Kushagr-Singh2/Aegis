// ============================================================
// src/lib/supabase.ts
// Supabase client singleton.
//
// ⚠️  Only the ANON key is used here — never the service-role
//     key. All data access is enforced by Row Level Security.
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[AEGIS] Missing Supabase environment variables.\n' +
    'Copy .env.example → .env and fill in SUPABASE_URL and SUPABASE_ANON_KEY.'
  );
}

/**
 * Typed Supabase client using the public anon key.
 * Row Level Security enforces all data isolation.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // Persist session in localStorage (browser) or in-memory (Node).
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export type { SupabaseClient };
