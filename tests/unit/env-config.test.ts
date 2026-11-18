import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { getPublicEnvironment } from '@/config';
import {
  EnvironmentConfigurationError,
  parseEnvironment,
} from '@/config/parse-environment';

describe('environment parsing & secret redaction', () => {
  it('never leaks raw secret values in EnvironmentConfigurationError messages', () => {
    const schema = z.strictObject({
      SUPABASE_SECRET_KEY: z.string().min(20),
    });

    const leakedSecret = 'super-short-secret';
    let caught: unknown;
    try {
      parseEnvironment(schema, { SUPABASE_SECRET_KEY: leakedSecret });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(EnvironmentConfigurationError);
    const err = caught as EnvironmentConfigurationError;
    expect(err.keys).toEqual(['SUPABASE_SECRET_KEY']);
    expect(err.message).toContain('SUPABASE_SECRET_KEY');
    expect(err.message).not.toContain(leakedSecret);
  });

  it('returns default NEXT_PUBLIC_SITE_URL from getPublicEnvironment', () => {
    const env = getPublicEnvironment();
    expect(env.NEXT_PUBLIC_SITE_URL).toMatch(/^https?:\/\//);
  });
});
