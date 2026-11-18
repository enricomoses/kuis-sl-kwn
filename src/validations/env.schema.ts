import { z } from 'zod';
import { APP_INFO } from '@/constants/app.constant';

export const publicEnvironmentSchema = z.strictObject({
  NEXT_PUBLIC_SITE_URL: z.url().default(APP_INFO.DEFAULT_LOCAL_URL),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1).optional(),
});

export const supabaseEnvironmentSchema = z.strictObject({
  url: z.url(),
  publishableKey: z.string().trim().min(1),
});
