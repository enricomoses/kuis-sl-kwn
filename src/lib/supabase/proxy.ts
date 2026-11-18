import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseEnvironment } from '@/config/environment.client';
import type { Database } from '@/types/database';
import { noStoreFetch } from './no-store-fetch';

export async function refreshAuthSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const { url, publishableKey } = getSupabaseEnvironment();
    const supabase = createServerClient<Database>(url, publishableKey, {
      global: { fetch: noStoreFetch },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.getClaims();
  } catch {
    // Proxy only refreshes auth tokens; final authorization happens in admin-guard.server.ts
  }

  return response;
}
