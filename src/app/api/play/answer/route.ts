import { GAME_LIMITS } from '@/constants/game.constant';
import { assertSameOriginRequest } from '@/features/auth/csrf.server';
import {
  createAuthJsonError,
  parseWithSchema,
} from '@/features/auth/http.server';
import { submitPlayerAnswer } from '@/features/play/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { readBoundedJsonBody } from '@/lib/request-body.server';
import { createSuccessResponse } from '@/lib/response.server';
import {
  answerRequestSchema,
  answerResponseSchema,
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
    const payload = parseWithSchema(answerRequestSchema, rawBody);
    const result = await submitPlayerAnswer(payload, requestId, request.signal);

    logServerEvent({
      requestId,
      route: '/api/play/answer',
      operation: 'answer_submitted',
      status: 200,
      durationMs: Date.now() - startedAt,
    });

    return createSuccessResponse(answerResponseSchema, result, requestId);
  } catch (error) {
    const response = createAuthJsonError(error, requestId);
    logServerEvent({
      requestId,
      route: '/api/play/answer',
      operation: 'answer_submitted',
      status: response.status,
      durationMs: Date.now() - startedAt,
      level: response.status >= 500 ? 'error' : 'warn',
    });
    return response;
  }
}
