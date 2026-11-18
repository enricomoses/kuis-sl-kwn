import type { z } from 'zod';

export class EnvironmentConfigurationError extends Error {
  readonly keys: readonly string[];

  constructor(keys: readonly string[]) {
    const label = keys.length > 0 ? keys.join(', ') : 'unknown';
    super(`Konfigurasi environment tidak valid atau belum diatur: ${label}`);
    this.name = 'EnvironmentConfigurationError';
    this.keys = keys;
  }
}

export function parseEnvironment<T>(
  schema: z.ZodType<T>,
  raw: Record<string, unknown>,
): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const keys = Array.from(
      new Set(
        parsed.error.issues.map((issue) =>
          issue.path.length > 0 ? String(issue.path[0]) : 'environment',
        ),
      ),
    );
    throw new EnvironmentConfigurationError(keys);
  }
  return parsed.data;
}
