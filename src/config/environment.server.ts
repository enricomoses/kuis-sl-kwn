import 'server-only';

import { z } from 'zod';
import { getPublicEnvironment } from '@/config/environment.client';
import { parseEnvironment } from '@/config/parse-environment';

const serverEnvironmentSchema = z.strictObject({
  APP_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
});

const serviceRoleEnvironmentSchema = z.strictObject({
  url: z.url(),
  secretKey: z.string().trim().min(1),
});

const playerTokenPepperSchema = z.strictObject({
  PLAYER_TOKEN_PEPPER: z.string().min(32),
});

export function getServerEnvironment() {
  return parseEnvironment(serverEnvironmentSchema, {
    APP_ENV: process.env.APP_ENV,
  });
}

export function getSupabaseServiceRoleEnvironment() {
  const publicEnv = getPublicEnvironment();
  return parseEnvironment(serviceRoleEnvironmentSchema, {
    url: publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
  });
}

export function getPlayerTokenPepper(): string {
  const parsed = parseEnvironment(playerTokenPepperSchema, {
    PLAYER_TOKEN_PEPPER: process.env.PLAYER_TOKEN_PEPPER,
  });
  return parsed.PLAYER_TOKEN_PEPPER;
}
