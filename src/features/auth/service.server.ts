import 'server-only';

import type { NextResponse } from 'next/server';
import { AUTH_COPY } from '@/constants/auth.constant';
import { ROUTES } from '@/constants/routes.constant';
import { LIMITS } from '@/constants/validation.constant';
import { createServerAuthClient } from '@/lib/supabase/server';
import type { LoginRequest, LoginResponse, LogoutResponse } from '@/types/auth';
import { AuthError } from './errors.server';

export function sanitizeAdminNextPath(rawNext?: string | null): string {
  if (!rawNext) return ROUTES.ADMIN_CONSOLE;
  const trimmed = rawNext.trim();
  if (
    !trimmed.startsWith('/admin') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith(ROUTES.ADMIN_LOGIN)
  ) {
    return ROUTES.ADMIN_CONSOLE;
  }
  return trimmed;
}

export async function loginAdmin(
  payload: LoginRequest,
  carrier: NextResponse,
): Promise<LoginResponse> {
  const supabase = await createServerAuthClient(carrier);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error || !data.user || !data.user.email) {
    throw new AuthError('UNAUTHORIZED', 401, {
      message: AUTH_COPY.ERROR_INVALID_CREDENTIALS,
    });
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', data.user.id)
    .abortSignal(AbortSignal.timeout(LIMITS.DB_READ_TIMEOUT_MS))
    .maybeSingle();

  if (adminError) {
    await supabase.auth.signOut();
    throw new AuthError('UPSTREAM_ERROR', 503);
  }

  if (!adminRow) {
    await supabase.auth.signOut();
    throw new AuthError('FORBIDDEN', 403, {
      message: AUTH_COPY.ERROR_NOT_ADMIN,
    });
  }

  return {
    profile: {
      userId: data.user.id,
      email: data.user.email,
      role: 'admin',
    },
    redirectTo: sanitizeAdminNextPath(payload.next),
  };
}

export async function logoutAdmin(
  carrier: NextResponse,
): Promise<LogoutResponse> {
  const supabase = await createServerAuthClient(carrier);
  await supabase.auth.signOut();
  return { signedOut: true };
}
