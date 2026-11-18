import { LIMITS } from '@/constants/validation.constant';
import { requireApiAdmin } from '@/features/auth/admin-guard.server';
import { assertSameOriginRequest } from '@/features/auth/csrf.server';
import {
  createAuthJsonError,
  createAuthJsonSuccess,
  createCookieCarrierResponse,
  parseWithSchema,
} from '@/features/auth/http.server';
import {
  createAdminGameSession,
  getAdminActiveGameState,
} from '@/features/game/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { readBoundedJsonBody } from '@/lib/request-body.server';
import {
  adminGameStateNullableSchema,
  adminGameStateSchema,
  createSessionSchema,
} from '@/validations/game.schema';

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    await requireApiAdmin(carrier);
    const state = await getAdminActiveGameState(request.signal);
    logServerEvent({
      requestId,
      route: '/api/admin/game',
      operation: 'get_admin_game',
      status: 200,
      durationMs: Date.now() - startedAt,
      sessionId: state?.session.id,
    });
    return createAuthJsonSuccess(
      state,
      adminGameStateNullableSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    assertSameOriginRequest(request);
    const admin = await requireApiAdmin(carrier);
    const rawBody = await readBoundedJsonBody(
      request,
      LIMITS.ADMIN_BODY_MAX_BYTES,
    );
    const payload = parseWithSchema(createSessionSchema, rawBody);
    const created = await createAdminGameSession(
      admin.userId,
      payload,
      requestId,
      request.signal,
    );

    logServerEvent({
      requestId,
      route: '/api/admin/game',
      operation: 'session_created',
      status: 201,
      durationMs: Date.now() - startedAt,
      sessionId: created.session.id,
    });

    return createAuthJsonSuccess(
      created,
      adminGameStateSchema,
      requestId,
      carrier,
      201,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
