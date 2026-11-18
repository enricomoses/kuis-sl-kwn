import type { QueryClient } from '@tanstack/react-query';
import { QUERY_LIMITS, STALE_TIME } from '@/constants/query-keys.constant';
import type { ApiSuccess } from '@/types';

export const ADMIN_QUERY_DEFAULTS = {
  staleTime: STALE_TIME.ADMIN_FRESH,
  gcTime: QUERY_LIMITS.ADMIN_GC_TIME_MS,
  retry: false,
} as const;

export async function unwrapData<T>(
  request: Promise<ApiSuccess<T>>,
): Promise<T> {
  const response = await request;
  return response.data;
}

export async function invalidateQueryKeys(
  queryClient: QueryClient,
  keys: readonly (readonly unknown[])[],
): Promise<void> {
  await Promise.all(
    keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}
