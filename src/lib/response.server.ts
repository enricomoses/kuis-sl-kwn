import 'server-only';

import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { ERROR_COPY } from '@/constants/copy.constant';
import type { ApiErrorCode, ApiMeta } from '@/types';
import { apiErrorSchema, apiSuccessSchema } from '@/validations/api.schema';

export function createSuccessResponse<T>(
  dataSchema: z.ZodType<T>,
  data: T,
  requestId: string,
  options?: {
    status?: number;
    meta?: ApiMeta;
    headers?: HeadersInit;
  },
) {
  const payload = apiSuccessSchema(dataSchema).parse({
    ok: true,
    data,
    requestId,
    ...(options?.meta ? { meta: options.meta } : {}),
  });

  const headers = new Headers(options?.headers);
  headers.set('Cache-Control', 'no-store');

  return NextResponse.json(payload, {
    status: options?.status ?? 200,
    headers,
  });
}

export function createErrorResponse(
  code: ApiErrorCode,
  requestId: string,
  options?: {
    status?: number;
    message?: string;
    fieldErrors?: Record<string, string[]>;
    headers?: HeadersInit;
  },
) {
  const payload = apiErrorSchema.parse({
    ok: false,
    error: {
      code,
      message: options?.message ?? ERROR_COPY[code],
      ...(options?.fieldErrors && Object.keys(options.fieldErrors).length > 0
        ? { fieldErrors: options.fieldErrors }
        : {}),
    },
    requestId,
  });

  const headers = new Headers(options?.headers);
  headers.set('Cache-Control', 'no-store');

  return NextResponse.json(payload, {
    status: options?.status ?? 400,
    headers,
  });
}
