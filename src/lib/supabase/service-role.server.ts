import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleEnvironment } from '@/config/environment.server';
import type { Database } from '@/types/database';
import { noStoreFetch } from './no-store-fetch';

/**
 * ADR-2: Dedicated service-role Supabase client.
 * ONLY importable inside src/features/<domain>/repository.server.ts (enforced by ESLint).
 */
export function createServiceRoleClient() {
  const { url, secretKey } = getSupabaseServiceRoleEnvironment();
  return createClient<Database>(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: noStoreFetch,
    },
  });
}
