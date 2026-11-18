import { LIMITS } from '@/constants/validation.constant';
import { requireApiAdmin } from '@/features/auth/admin-guard.server';
import { assertSameOriginRequest } from '@/features/auth/csrf.server';
import {
  createAuthJsonError,
  createAuthJsonSuccess,
  createCookieCarrierResponse,
  parseWithSchema,
} from '@/features/auth/http.server';
import { reorderAdminQuestions } from '@/features/question/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { readBoundedJsonBody } from '@/lib/request-body.server';
import {
  adminQuestionListResponseSchema,
  reorderQuestionsSchema,
} from '@/validations/question.schema';

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    assertSameOriginRequest(request);
    await requireApiAdmin(carrier);
    const rawBody = await readBoundedJsonBody(
      request,
      LIMITS.ADMIN_BODY_MAX_BYTES,
    );
    const payload = parseWithSchema(reorderQuestionsSchema, rawBody);
    const updated = await reorderAdminQuestions(
      payload.orderedIds,
      carrier,
      request.signal,
    );

    logServerEvent({
      requestId,
      route: '/api/admin/questions/reorder',
      operation: 'reorder_questions',
      status: 200,
      durationMs: Date.now() - startedAt,
    });

    return createAuthJsonSuccess(
      updated,
      adminQuestionListResponseSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
