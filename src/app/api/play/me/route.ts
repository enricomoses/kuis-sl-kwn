import { createAuthJsonError } from '@/features/auth/http.server';
import { getPlayMe } from '@/features/play/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { createSuccessResponse } from '@/lib/response.server';
import { playMeSchema } from '@/validations/game.schema';

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const data = await getPlayMe(request.signal);
    logServerEvent({
      requestId,
      route: '/api/play/me',
      operation: 'play_me',
      status: 200,
      durationMs: Date.now() - startedAt,
      sessionId: data.session?.id,
    });
    return createSuccessResponse(playMeSchema, data, requestId);
  } catch (error) {
    return createAuthJsonError(error, requestId);
  }
}
