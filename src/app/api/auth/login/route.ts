import { LIMITS } from '@/constants/validation.constant';
import { assertSameOriginRequest } from '@/features/auth/csrf.server';
import {
  createAuthJsonError,
  createAuthJsonSuccess,
  createCookieCarrierResponse,
  parseWithSchema,
} from '@/features/auth/http.server';
import { loginAdmin } from '@/features/auth/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { readBoundedJsonBody } from '@/lib/request-body.server';
import {
  loginRequestSchema,
  loginResponseSchema,
} from '@/validations/auth.schema';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    assertSameOriginRequest(request);
    const rawBody = await readBoundedJsonBody(
      request,
      LIMITS.AUTH_BODY_MAX_BYTES,
    );
    const payload = parseWithSchema(loginRequestSchema, rawBody);
    const result = await loginAdmin(payload, carrier);

    logServerEvent({
      requestId,
      route: '/api/auth/login',
      operation: 'admin_login',
      status: 200,
      durationMs: Date.now() - startedAt,
    });

    return createAuthJsonSuccess(
      result,
      loginResponseSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    const response = createAuthJsonError(error, requestId, carrier);
    logServerEvent({
      requestId,
      route: '/api/auth/login',
      operation: 'admin_login',
      status: response.status,
      durationMs: Date.now() - startedAt,
      level: response.status >= 500 ? 'error' : 'warn',
    });
    return response;
  }
}
