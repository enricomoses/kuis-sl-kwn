import { LIMITS } from '@/constants/validation.constant';
import { requireApiAdmin } from '@/features/auth/admin-guard.server';
import { assertSameOriginRequest } from '@/features/auth/csrf.server';
import {
  createAuthJsonError,
  createAuthJsonSuccess,
  createCookieCarrierResponse,
  parseWithSchema,
} from '@/features/auth/http.server';
import {
  createAdminQuestion,
  listAdminQuestions,
} from '@/features/question/service.server';
import { logServerEvent } from '@/lib/logger.server';
import { readBoundedJsonBody } from '@/lib/request-body.server';
import {
  adminQuestionListResponseSchema,
  adminQuestionSchema,
  questionFormSchema,
} from '@/validations/question.schema';

export async function GET(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const carrier = createCookieCarrierResponse();

  try {
    await requireApiAdmin(carrier);
    const data = await listAdminQuestions(carrier, request.signal);
    logServerEvent({
      requestId,
      route: '/api/admin/questions',
      operation: 'list_questions',
      status: 200,
      durationMs: Date.now() - startedAt,
    });
    return createAuthJsonSuccess(
      data,
      adminQuestionListResponseSchema,
      requestId,
      carrier,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}

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
    const payload = parseWithSchema(questionFormSchema, rawBody);
    const created = await createAdminQuestion(payload, carrier, request.signal);

    logServerEvent({
      requestId,
      route: '/api/admin/questions',
      operation: 'create_question',
      status: 201,
      durationMs: Date.now() - startedAt,
    });

    return createAuthJsonSuccess(
      created,
      adminQuestionSchema,
      requestId,
      carrier,
      201,
    );
  } catch (error) {
    return createAuthJsonError(error, requestId, carrier);
  }
}
