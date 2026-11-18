import 'server-only';

import { NextResponse } from 'next/server';
import type { z } from 'zod';
import {
  InvalidJsonBodyError,
  PayloadTooLargeError,
} from '@/lib/request-body.server';
import {
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/response.server';
import { ServerDomainError } from './errors.server';

export function createCookieCarrierResponse(): NextResponse {
  return new NextResponse(null, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

function copyCarrierMetadata(
  carrier: NextResponse,
  target: NextResponse,
): void {
  carrier.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
  carrier.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    if (key.toLowerCase() === 'content-type') return;
    target.headers.set(key, value);
  });
}

export function parseWithSchema<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }

  const fieldErrors: Record<string, string[]> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : '_form';
    const existing = fieldErrors[key] ?? [];
    existing.push(issue.message);
    fieldErrors[key] = existing;
  }

  throw new ServerDomainError('INVALID_REQUEST', 422, {
    fieldErrors,
  });
}

export function createAuthJsonSuccess<T>(
  data: T,
  dataSchema: z.ZodType<T>,
  requestId: string,
  carrier?: NextResponse,
  status = 200,
): NextResponse {
  const response = createSuccessResponse(dataSchema, data, requestId, {
    status,
  });
  if (carrier) {
    copyCarrierMetadata(carrier, response);
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export function createAuthJsonError(
  error: unknown,
  requestId: string,
  carrier?: NextResponse,
): NextResponse {
  let response: NextResponse;

  if (error instanceof ServerDomainError) {
    response = createErrorResponse(error.code, requestId, {
      status: error.status,
      message: error.message,
      fieldErrors: error.fieldErrors,
    });
  } else if (error instanceof PayloadTooLargeError) {
    response = createErrorResponse('PAYLOAD_TOO_LARGE', requestId, {
      status: 413,
    });
  } else if (error instanceof InvalidJsonBodyError) {
    response = createErrorResponse('INVALID_REQUEST', requestId, {
      status: 400,
    });
  } else {
    response = createErrorResponse('UPSTREAM_ERROR', requestId, {
      status: 503,
    });
  }

  if (carrier) {
    copyCarrierMetadata(carrier, response);
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
