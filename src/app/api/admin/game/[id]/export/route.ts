import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiAdmin } from '@/features/auth/admin-guard.server';
import { ServerDomainError } from '@/features/auth/errors.server';
import {
  createAuthJsonError,
  createCookieCarrierResponse,
} from '@/features/auth/http.server';
import { exportGameSessionCsv } from '@/features/game/service.server';
import { logServerEvent } from '@/lib/logger.server';

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

    const { filename, csv } = await exportGameSessionCsv(
      parsedId.data,
      request.signal,
    );

    const response = new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });

    carrier.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });

    logServerEvent({
      requestId,
      route: '/api/admin/game/[id]/export',
      operation: 'export_session_csv',
      status: 200,
      durationMs: Date.now() - startedAt,
      sessionId: parsedId.data,
    });

    return response;
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
