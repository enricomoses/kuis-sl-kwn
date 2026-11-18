import { assertSameOriginRequest } from '@/features/auth/csrf.server';
import {
  createAuthJsonError,
  createAuthJsonSuccess,
  createCookieCarrierResponse,
} from '@/features/auth/http.server';
import { logoutAdmin } from '@/features/auth/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { logoutResponseSchema } from '@/validations/auth.schema';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    assertSameOriginRequest(request);
    const result = await logoutAdmin(carrier);

    logServerEvent({
      requestId,
      route: '/api/auth/logout',
      operation: 'admin_logout',
      status: 200,
      durationMs: Date.now() - startedAt,
    });

    return createAuthJsonSuccess(
      result,
      logoutResponseSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
