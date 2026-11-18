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
import {
  archiveAdminQuestion,
  updateAdminQuestion,
} from '@/features/question/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { readBoundedJsonBody } from '@/lib/request-body.server';
import {
  adminQuestionSchema,
  archiveQuestionResponseSchema,
  updateQuestionSchema,
} from '@/validations/question.schema';

const uuidSchema = z.uuid();

interface RouteContext {
  params: Promise<{ id: string }>;
}

function parseUuidParam(value: string): string {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) {
    throw new ServerDomainError('INVALID_REQUEST', 400);
  }
  return parsed.data;
}

export async function PATCH(request: Request, context: RouteContext) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    assertSameOriginRequest(request);
    await requireApiAdmin(carrier);
    const { id } = await context.params;
    const questionId = parseUuidParam(id);
    const rawBody = await readBoundedJsonBody(
      request,
      LIMITS.ADMIN_BODY_MAX_BYTES,
    );
    const payload = parseWithSchema(updateQuestionSchema, rawBody);
    const updated = await updateAdminQuestion(
      questionId,
      payload,
      carrier,
      request.signal,
    );

    logServerEvent({
      requestId,
      route: '/api/admin/questions/[id]',
      operation: 'update_question',
      status: 200,
      durationMs: Date.now() - startedAt,
    });

    return createAuthJsonSuccess(
      updated,
      adminQuestionSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    assertSameOriginRequest(request);
    await requireApiAdmin(carrier);
    const { id } = await context.params;
    const questionId = parseUuidParam(id);
    const result = await archiveAdminQuestion(
      questionId,
      carrier,
      request.signal,
    );

    logServerEvent({
      requestId,
      route: '/api/admin/questions/[id]',
      operation: 'archive_question',
      status: 200,
      durationMs: Date.now() - startedAt,
    });

    return createAuthJsonSuccess(
      result,
      archiveQuestionResponseSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
