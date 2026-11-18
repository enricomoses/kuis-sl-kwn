import { z } from 'zod';
import { requireApiAdmin } from '@/features/auth/admin-guard.server';
import { ServerDomainError } from '@/features/auth/errors.server';
import {
  createAuthJsonError,
  createAuthJsonSuccess,
  createCookieCarrierResponse,
} from '@/features/auth/http.server';
import { getGameSessionResults } from '@/features/game/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { sessionResultsResponseSchema } from '@/validations/game.schema';

const uuidSchema = z.uuid();

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    await requireApiAdmin(carrier);
    const { id } = await context.params;
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) {
      throw new ServerDomainError('INVALID_REQUEST', 400);
    }

    const data = await getGameSessionResults(parsedId.data, request.signal);

    logServerEvent({
      requestId,
      route: '/api/admin/game/[id]/results',
      operation: 'get_session_results',
      status: 200,
      durationMs: Date.now() - startedAt,
      sessionId: parsedId.data,
    });

    return createAuthJsonSuccess(
      data,
      sessionResultsResponseSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
