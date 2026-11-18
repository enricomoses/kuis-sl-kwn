'use client';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnvironment } from '@/config';
import type { Database } from '@/types/database';

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * ADR-1: Anonymous, session-less Supabase client exclusively for Realtime Broadcast channels.
 */
export function getRealtimeClient(): SupabaseClient<Database> {
  if (cachedClient) return cachedClient;
  const { url, publishableKey } = getSupabaseEnvironment();
  cachedClient = createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return cachedClient;
}
