import { requireApiAdmin } from '@/features/auth/admin-guard.server';
import {
  createAuthJsonError,
  createAuthJsonSuccess,
  createCookieCarrierResponse,
} from '@/features/auth/http.server';
import { getAdminLiveLeaderboard } from '@/features/game/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { adminLeaderboardStateNullableSchema } from '@/validations/game.schema';

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    await requireApiAdmin(carrier);
    const state = await getAdminLiveLeaderboard(request.signal);
    logServerEvent({
      requestId,
      route: '/api/admin/game/leaderboard',
      operation: 'get_admin_leaderboard',
      status: 200,
      durationMs: Date.now() - startedAt,
      sessionId: state?.session.id,
    });
    return createAuthJsonSuccess(
      state,
      adminLeaderboardStateNullableSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
