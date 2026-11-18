import 'server-only';

import type { NextResponse } from 'next/server';
import type { Database } from '@/types/database';
import type {
  AdminQuestion,
  AdminQuestionListResponse,
  QuestionFormInput,
  UpdateQuestionInput,
} from '@/types/question';
import {
  adminQuestionListResponseSchema,
  adminQuestionSchema,
  questionOptionSchema,
} from '@/validations/question.schema';
import { z } from 'zod';
import { QuestionError } from './errors.server';
import {
  archiveQuestionRow,
  checkQuestionBankLocked,
  insertQuestionRow,
  readActiveQuestionExists,
  readActiveQuestions,
  updateQuestionPositions,
  updateQuestionRowOptimistic,
} from './repository.server';

type QuestionRow = Database['public']['Tables']['questions']['Row'];

function mapQuestionRow(row: QuestionRow): AdminQuestion {
  const options = z.array(questionOptionSchema).parse(row.options);
  return adminQuestionSchema.parse({
    id: row.id,
    type: row.type,
    prompt: row.prompt,
    options,
    correctOptionId: row.correct_option_id,
    explanation: row.explanation,
    timeLimitSeconds: row.time_limit_seconds,
    basePoints: row.base_points,
    position: row.position,
    updatedAt: row.updated_at,
  });
}

async function assertBankNotLocked(
  carrier: NextResponse,
  signal?: AbortSignal,
) {
  const locked = await checkQuestionBankLocked(carrier, signal);
  if (locked) {
    throw new QuestionError('QUESTION_BANK_LOCKED', 409);
  }
}

export async function listAdminQuestions(
  carrier?: NextResponse,
  signal?: AbortSignal,
): Promise<AdminQuestionListResponse> {
  const [rows, locked] = await Promise.all([
    readActiveQuestions(carrier, signal),
    checkQuestionBankLocked(carrier, signal),
  ]);

  return adminQuestionListResponseSchema.parse({
    items: rows.map(mapQuestionRow),
    locked,
  });
}

export async function createAdminQuestion(
  input: QuestionFormInput,
  carrier: NextResponse,
  signal?: AbortSignal,
): Promise<AdminQuestion> {
  await assertBankNotLocked(carrier, signal);
  const existing = await readActiveQuestions(carrier, signal);
  const maxPosition = existing.reduce(
    (max, item) => Math.max(max, item.position),
    0,
  );
  const created = await insertQuestionRow(
    input,
    maxPosition + 1,
    carrier,
    signal,
  );
  return mapQuestionRow(created);
}

export async function updateAdminQuestion(
  id: string,
  input: UpdateQuestionInput,
  carrier: NextResponse,
  signal?: AbortSignal,
): Promise<AdminQuestion> {
  await assertBankNotLocked(carrier, signal);
  const updated = await updateQuestionRowOptimistic(
    id,
    input,
    input.expectedUpdatedAt,
    carrier,
    signal,
  );

  if (updated) {
    return mapQuestionRow(updated);
  }

  const stillExists = await readActiveQuestionExists(id, carrier, signal);
  if (stillExists) {
    throw new QuestionError('CONFLICT', 409);
  }
  throw new QuestionError('NOT_FOUND', 404);
}

export async function archiveAdminQuestion(
  id: string,
  carrier: NextResponse,
  signal?: AbortSignal,
): Promise<{ archived: true; id: string }> {
  await assertBankNotLocked(carrier, signal);
  const archived = await archiveQuestionRow(id, carrier, signal);
  if (!archived) {
    throw new QuestionError('NOT_FOUND', 404);
  }
  return { archived: true, id };
}

export async function reorderAdminQuestions(
  orderedIds: readonly string[],
  carrier: NextResponse,
  signal?: AbortSignal,
): Promise<AdminQuestionListResponse> {
  await assertBankNotLocked(carrier, signal);
  const existing = await readActiveQuestions(carrier, signal);
  const existingIds = new Set(existing.map((row) => row.id));
  const uniqueRequested = new Set(orderedIds);

  if (
    uniqueRequested.size !== orderedIds.length ||
    uniqueRequested.size !== existingIds.size ||
    !orderedIds.every((id) => existingIds.has(id))
  ) {
    throw new QuestionError('CONFLICT', 409);
  }

  await updateQuestionPositions(orderedIds, carrier, signal);
  return listAdminQuestions(carrier, signal);
}
