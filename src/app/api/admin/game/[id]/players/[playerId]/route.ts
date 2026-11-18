import { z } from 'zod';
import { requireApiAdmin } from '@/features/auth/admin-guard.server';
import { assertSameOriginRequest } from '@/features/auth/csrf.server';
import { ServerDomainError } from '@/features/auth/errors.server';
import {
  createAuthJsonError,
  createAuthJsonSuccess,
  createCookieCarrierResponse,
} from '@/features/auth/http.server';
import { kickGamePlayer } from '@/features/game/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { kickPlayerResponseSchema } from '@/validations/game.schema';

const uuidSchema = z.uuid();

interface RouteContext {
  params: Promise<{ id: string; playerId: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    assertSameOriginRequest(request);
    await requireApiAdmin(carrier);
    const { id, playerId } = await context.params;
    const parsedSession = uuidSchema.safeParse(id);
    const parsedPlayer = uuidSchema.safeParse(playerId);
    if (!parsedSession.success || !parsedPlayer.success) {
      throw new ServerDomainError('INVALID_REQUEST', 400);
    }

    const result = await kickGamePlayer(
      parsedSession.data,
      parsedPlayer.data,
      requestId,
      request.signal,
    );

    logServerEvent({
      requestId,
      route: '/api/admin/game/[id]/players/[playerId]',
      operation: 'kick_player',
      status: 200,
      durationMs: Date.now() - startedAt,
      sessionId: parsedSession.data,
      playerId: parsedPlayer.data,
    });

    return createAuthJsonSuccess(
      result,
      kickPlayerResponseSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
