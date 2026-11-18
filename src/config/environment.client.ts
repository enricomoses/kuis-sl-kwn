import {
  publicEnvironmentSchema,
  supabaseEnvironmentSchema,
} from '@/validations/env.schema';
import { parseEnvironment } from './parse-environment';

export function getPublicEnvironment() {
  return parseEnvironment(publicEnvironmentSchema, {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export function getSupabaseEnvironment() {
  const environment = getPublicEnvironment();
  return parseEnvironment(supabaseEnvironmentSchema, {
    url: environment.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
