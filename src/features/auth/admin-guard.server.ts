import 'server-only';

import { redirect } from 'next/navigation';
import type { NextResponse } from 'next/server';
import { AUTH_COPY } from '@/constants/auth.constant';
import { ROUTES } from '@/constants/routes.constant';
import { LIMITS } from '@/constants/validation.constant';
import { createServerAuthClient } from '@/lib/supabase/server';
import type { AdminSessionProfile } from '@/types/auth';
import { AuthError } from './errors.server';

export async function getAdminSessionProfile(
  response?: NextResponse,
): Promise<AdminSessionProfile | null> {
  try {
    const supabase = await createServerAuthClient(response);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user || !userData.user.email) {
      return null;
    }

    const { data: adminRow, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .abortSignal(AbortSignal.timeout(LIMITS.DB_READ_TIMEOUT_MS))
      .maybeSingle();

    if (adminError || !adminRow) {
      return null;
    }

    return {
      userId: userData.user.id,
      email: userData.user.email,
      role: 'admin',
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession(
  nextPath: string = ROUTES.ADMIN_CONSOLE,
): Promise<AdminSessionProfile> {
  const profile = await getAdminSessionProfile();
  if (!profile) {
    const query =
      nextPath && nextPath !== ROUTES.ADMIN_CONSOLE
        ? `?next=${encodeURIComponent(nextPath)}`
        : '';
    redirect(`${ROUTES.ADMIN_LOGIN}${query}`);
  }
  return profile;
}

export async function requireApiAdmin(
  response: NextResponse,
): Promise<AdminSessionProfile> {
  const supabase = await createServerAuthClient(response);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user || !userData.user.email) {
    throw new AuthError('UNAUTHORIZED', 401);
  }

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userData.user.id)
    .abortSignal(AbortSignal.timeout(LIMITS.DB_READ_TIMEOUT_MS))
    .maybeSingle();

  if (adminError) {
    throw new AuthError('UPSTREAM_ERROR', 503);
  }

  if (!adminRow) {
    throw new AuthError('FORBIDDEN', 403, {
      message: AUTH_COPY.ERROR_NOT_ADMIN,
    });
  }

  return {
    userId: userData.user.id,
    email: userData.user.email,
    role: 'admin',
  };
}
