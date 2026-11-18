import { createAuthJsonError } from '@/features/auth/http.server';
import { getPlayerGameState } from '@/features/play/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { createSuccessResponse } from '@/lib/response.server';
import { playerStateSchema } from '@/validations/game.schema';

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const state = await getPlayerGameState(request.signal);
    logServerEvent({
      requestId,
      route: '/api/play/state',
      operation: 'player_state',
      status: 200,
      durationMs: Date.now() - startedAt,
      sessionId: state.session.id,
      playerId: state.me.id,
    });
    return createSuccessResponse(playerStateSchema, state, requestId);
  } catch (error) {
    return createAuthJsonError(error, requestId);
  }
}
