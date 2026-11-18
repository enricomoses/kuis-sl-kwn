import { requireApiAdmin } from '@/features/auth/admin-guard.server';
import {
  createAuthJsonError,
  createAuthJsonSuccess,
  createCookieCarrierResponse,
} from '@/features/auth/http.server';
import { listGameSessionHistory } from '@/features/game/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { sessionHistoryResponseSchema } from '@/validations/game.schema';

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    await requireApiAdmin(carrier);
    const data = await listGameSessionHistory(request.signal);

    logServerEvent({
      requestId,
      route: '/api/admin/game/history',
      operation: 'list_session_history',
      status: 200,
      durationMs: Date.now() - startedAt,
    });

    return createAuthJsonSuccess(
      data,
      sessionHistoryResponseSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
