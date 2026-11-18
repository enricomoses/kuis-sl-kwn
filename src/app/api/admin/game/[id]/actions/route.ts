import { z } from 'zod';
import { LIMITS } from '@/constants/validation.constant';
import { requireApiAdmin } from '@/features/auth/admin-guard.server';
import { assertSameOriginRequest } from '@/features/auth/csrf.server';
import { ServerDomainError } from '@/features/auth/errors.server';
import {
  createAuthJsonError,
  createAuthJsonSuccess,
  createCookieCarrierResponse,
  parseWithSchema,
} from '@/features/auth/http.server';
import { performAdminGameAction } from '@/features/game/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { readBoundedJsonBody } from '@/lib/request-body.server';
import {
  adminGameStateSchema,
  adminSessionActionSchema,
} from '@/validations/game.schema';

const uuidSchema = z.uuid();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    assertSameOriginRequest(request);
    await requireApiAdmin(carrier);
    const { id } = await context.params;
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) {
      throw new ServerDomainError('INVALID_REQUEST', 400);
    }

    const rawBody = await readBoundedJsonBody(
      request,
      LIMITS.ADMIN_BODY_MAX_BYTES,
    );
    const payload = parseWithSchema(adminSessionActionSchema, rawBody);
    const nextState = await performAdminGameAction(
      parsedId.data,
      payload,
      requestId,
      request.signal,
    );

    const operation =
      payload.action === 'start' || payload.action === 'next'
        ? 'question_started'
        : `session_${payload.action}`;

    logServerEvent({
      requestId,
      route: '/api/admin/game/[id]/actions',
      operation,
      status: 200,
      durationMs: Date.now() - startedAt,
      sessionId: nextState.session.id,
    });

    return createAuthJsonSuccess(
      nextState,
      adminGameStateSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
