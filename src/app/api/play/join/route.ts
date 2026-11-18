import { GAME_LIMITS } from '@/constants/game.constant';
import { assertSameOriginRequest } from '@/features/auth/csrf.server';
import {
  createAuthJsonError,
  parseWithSchema,
} from '@/features/auth/http.server';
import { setPlayerCookie } from '@/features/play/identity.server';
import { joinActiveSession } from '@/features/play/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { readBoundedJsonBody } from '@/lib/request-body.server';
import { createSuccessResponse } from '@/lib/response.server';
import {
  joinRequestSchema,
  joinResponseSchema,
} from '@/validations/game.schema';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();

  try {
    assertSameOriginRequest(request);
    const rawBody = await readBoundedJsonBody(
      request,
      GAME_LIMITS.PLAYER_BODY_MAX_BYTES,
    );
    const payload = parseWithSchema(joinRequestSchema, rawBody);
    const joined = await joinActiveSession(payload, requestId, request.signal);

    const response = createSuccessResponse(
      joinResponseSchema,
      joined.data,
      requestId,
      { status: 201 },
    );
    setPlayerCookie(response, joined.playerId, joined.token);

    logServerEvent({
      requestId,
      route: '/api/play/join',
      operation: 'player_joined',
      status: 201,
      durationMs: Date.now() - startedAt,
      sessionId: joined.data.session.id,
      playerId: joined.playerId,
    });

    return response;
  } catch (error) {
    const response = createAuthJsonError(error, requestId);
    logServerEvent({
      requestId,
      route: '/api/play/join',
      operation: 'player_joined',
      status: response.status,
      durationMs: Date.now() - startedAt,
      level: response.status >= 500 ? 'error' : 'warn',
    });
    return response;
  }
}
