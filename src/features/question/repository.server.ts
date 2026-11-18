import 'server-only';

import type { NextResponse } from 'next/server';
import { LIMITS } from '@/constants/validation.constant';
import { createServerAuthClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import type { QuestionFormInput } from '@/types/question';
import { QuestionError } from './errors.server';

type QuestionRow = Database['public']['Tables']['questions']['Row'];

function withReadDeadline(signal?: AbortSignal) {
  const deadline = AbortSignal.timeout(LIMITS.DB_READ_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, deadline]) : deadline;
}

function withWriteDeadline(signal?: AbortSignal) {
  const deadline = AbortSignal.timeout(LIMITS.DB_WRITE_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, deadline]) : deadline;
}

const QUESTION_SELECT_COLUMNS =
  'id,type,prompt,options,correct_option_id,explanation,time_limit_seconds,base_points,position,updated_at,archived_at,created_at';

export async function readActiveQuestions(
  carrier?: NextResponse,
  signal?: AbortSignal,
): Promise<QuestionRow[]> {
  const supabase = await createServerAuthClient(carrier);
  const { data, error } = await supabase
    .from('questions')
    .select(QUESTION_SELECT_COLUMNS)
    .is('archived_at', null)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .abortSignal(withReadDeadline(signal));

  if (error) {
    throw new QuestionError('UPSTREAM_ERROR', 503);
  }
  return data ?? [];
}

export async function checkQuestionBankLocked(
  carrier?: NextResponse,
  signal?: AbortSignal,
): Promise<boolean> {
  const supabase = await createServerAuthClient(carrier);
  const { data, error } = await supabase
    .from('game_sessions')
    .select('id')
    .in('status', ['lobby', 'running'])
    .limit(1)
    .abortSignal(withReadDeadline(signal));

  if (error) {
    throw new QuestionError('UPSTREAM_ERROR', 503);
  }
  return (data?.length ?? 0) > 0;
}

export async function insertQuestionRow(
  input: QuestionFormInput,
  position: number,
  carrier: NextResponse,
  signal?: AbortSignal,
): Promise<QuestionRow> {
  const supabase = await createServerAuthClient(carrier);
  const { data, error } = await supabase
    .from('questions')
    .insert({
      type: input.type,
      prompt: input.prompt,
      options: input.options.map((opt) => ({ id: opt.id, text: opt.text })),
      correct_option_id: input.correctOptionId,
      explanation: input.explanation ?? null,
      time_limit_seconds: input.timeLimitSeconds,
      base_points: input.basePoints,
      position,
    })
    .select(QUESTION_SELECT_COLUMNS)
    .abortSignal(withWriteDeadline(signal))
    .single();

  if (error || !data) {
    throw new QuestionError('UPSTREAM_ERROR', 503);
  }
  return data;
}

export async function updateQuestionRowOptimistic(
  id: string,
  input: QuestionFormInput,
  expectedUpdatedAt: string,
  carrier: NextResponse,
  signal?: AbortSignal,
): Promise<QuestionRow | null> {
  const supabase = await createServerAuthClient(carrier);
  const { data, error } = await supabase
    .from('questions')
    .update({
      type: input.type,
      prompt: input.prompt,
      options: input.options.map((opt) => ({ id: opt.id, text: opt.text })),
      correct_option_id: input.correctOptionId,
      explanation: input.explanation ?? null,
      time_limit_seconds: input.timeLimitSeconds,
      base_points: input.basePoints,
    })
    .eq('id', id)
    .is('archived_at', null)
    .eq('updated_at', expectedUpdatedAt)
    .select(QUESTION_SELECT_COLUMNS)
    .abortSignal(withWriteDeadline(signal))
    .maybeSingle();

  if (error) {
    throw new QuestionError('UPSTREAM_ERROR', 503);
  }
  return data;
}

export async function readActiveQuestionExists(
  id: string,
  carrier: NextResponse,
  signal?: AbortSignal,
): Promise<boolean> {
  const supabase = await createServerAuthClient(carrier);
  const { data, error } = await supabase
    .from('questions')
    .select('id')
    .eq('id', id)
    .is('archived_at', null)
    .abortSignal(withReadDeadline(signal))
    .maybeSingle();

  if (error) {
    throw new QuestionError('UPSTREAM_ERROR', 503);
  }
  return Boolean(data);
}

export async function archiveQuestionRow(
  id: string,
  carrier: NextResponse,
  signal?: AbortSignal,
): Promise<boolean> {
  const supabase = await createServerAuthClient(carrier);
  const { data, error } = await supabase
    .from('questions')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .is('archived_at', null)
    .select('id')
    .abortSignal(withWriteDeadline(signal))
    .maybeSingle();

  if (error) {
    throw new QuestionError('UPSTREAM_ERROR', 503);
  }
  return Boolean(data);
}

export async function updateQuestionPositions(
  orderedIds: readonly string[],
  carrier: NextResponse,
  signal?: AbortSignal,
): Promise<void> {
  const supabase = await createServerAuthClient(carrier);
  for (let index = 0; index < orderedIds.length; index += 1) {
    const id = orderedIds[index];
    const { error } = await supabase
      .from('questions')
      .update({ position: index + 1 })
      .eq('id', id)
      .is('archived_at', null)
      .abortSignal(withWriteDeadline(signal));
    if (error) {
      throw new QuestionError('UPSTREAM_ERROR', 503);
    }
  }
}
