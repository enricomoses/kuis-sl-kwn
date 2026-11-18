import 'server-only';

import { LIMITS } from '@/constants/validation.constant';
import { createServiceRoleClient } from '@/lib/supabase/service-role.server';
import type { Database } from '@/types/database';
import type { AdminSessionAction } from '@/types/game';
import { GameError, mapRpcError } from './errors.server';

export type GameSessionRow =
  Database['public']['Tables']['game_sessions']['Row'];
export type PlayerRow = Database['public']['Tables']['players']['Row'];
export type QuestionRow = Database['public']['Tables']['questions']['Row'];
export type AnswerRow = Database['public']['Tables']['answers']['Row'];
export type LeaderboardRpcRow =
  Database['public']['Functions']['get_leaderboard']['Returns'][number];
export type JoinSessionRpcRow =
  Database['public']['Functions']['join_session']['Returns'][number];
export type SubmitAnswerRpcRow =
  Database['public']['Functions']['submit_answer']['Returns'][number];
export type KickPlayerRpcRow =
  Database['public']['Functions']['kick_player']['Returns'][number];

function withReadDeadline(signal?: AbortSignal) {
  const deadline = AbortSignal.timeout(LIMITS.DB_READ_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, deadline]) : deadline;
}

function withWriteDeadline(signal?: AbortSignal) {
  const deadline = AbortSignal.timeout(LIMITS.DB_WRITE_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, deadline]) : deadline;
}

const SESSION_COLUMNS =
  'id,status,question_order,total_questions,current_index,question_started_at,question_ends_at,question_closed_at,allow_late_join,join_pin,state_version,created_by,created_at,started_at,finished_at';

const PLAYER_COLUMNS =
  'id,session_id,name,name_key,token_hash,total_score,correct_count,total_correct_ms,joined_at';

const QUESTION_COLUMNS =
  'id,type,prompt,options,correct_option_id,explanation,time_limit_seconds,base_points,position,archived_at,created_at,updated_at';

const ANSWER_COLUMNS =
  'id,session_id,player_id,question_id,question_index,selected_option_id,is_correct,response_ms,points,answered_at';

export async function rpcCreateSession(
  params: {
    createdBy: string | null;
    allowLateJoin: boolean;
    joinPin: string | null;
  },
  signal?: AbortSignal,
): Promise<GameSessionRow> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .rpc('create_session', {
      p_created_by: params.createdBy,
      p_allow_late_join: params.allowLateJoin,
      p_join_pin: params.joinPin,
    })
    .abortSignal(withWriteDeadline(signal));

  if (error) {
    throw mapRpcError(error.message);
  }
  if (!data) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data;
}

export async function rpcJoinSession(
  params: {
    name: string;
    tokenHash: string;
    pin: string | null;
  },
  signal?: AbortSignal,
): Promise<JoinSessionRpcRow> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .rpc('join_session', {
      p_name: params.name,
      p_token_hash: params.tokenHash,
      p_pin: params.pin,
    })
    .abortSignal(withWriteDeadline(signal));

  if (error) {
    throw mapRpcError(error.message);
  }
  const row = data?.[0];
  if (!row) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return row;
}

export async function rpcAdvanceSession(
  params: {
    sessionId: string;
    expectedVersion: number;
    action: AdminSessionAction;
    leadInMs: number;
  },
  signal?: AbortSignal,
): Promise<GameSessionRow> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .rpc('advance_session', {
      p_session_id: params.sessionId,
      p_expected_version: params.expectedVersion,
      p_action: params.action,
      p_lead_in_ms: params.leadInMs,
    })
    .abortSignal(withWriteDeadline(signal));

  if (error) {
    throw mapRpcError(error.message);
  }
  if (!data) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data;
}

export async function rpcSubmitAnswer(
  params: {
    sessionId: string;
    playerId: string;
    questionIndex: number;
    optionId: string;
  },
  signal?: AbortSignal,
): Promise<SubmitAnswerRpcRow> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .rpc('submit_answer', {
      p_session_id: params.sessionId,
      p_player_id: params.playerId,
      p_question_index: params.questionIndex,
      p_option_id: params.optionId,
    })
    .abortSignal(withWriteDeadline(signal));

  if (error) {
    throw mapRpcError(error.message);
  }
  const row = data?.[0];
  if (!row) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return row;
}

export async function rpcGetDbNow(signal?: AbortSignal): Promise<string> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .rpc('get_db_now')
    .abortSignal(withReadDeadline(signal));

  if (error || !data) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data;
}

export async function rpcGetLeaderboard(
  sessionId: string,
  limit?: number,
  signal?: AbortSignal,
): Promise<LeaderboardRpcRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .rpc('get_leaderboard', {
      p_session_id: sessionId,
      p_limit: limit ?? null,
    })
    .abortSignal(withReadDeadline(signal));

  if (error) {
    throw mapRpcError(error.message);
  }
  return data ?? [];
}

export async function rpcKickPlayer(
  sessionId: string,
  playerId: string,
  signal?: AbortSignal,
): Promise<KickPlayerRpcRow> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .rpc('kick_player', {
      p_session_id: sessionId,
      p_player_id: playerId,
    })
    .abortSignal(withWriteDeadline(signal));

  if (error) {
    throw mapRpcError(error.message);
  }
  const row = data?.[0];
  if (!row) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return row;
}

export async function readActiveSession(
  signal?: AbortSignal,
): Promise<GameSessionRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('game_sessions')
    .select(SESSION_COLUMNS)
    .in('status', ['lobby', 'running'])
    .order('created_at', { ascending: false })
    .limit(1)
    .abortSignal(withReadDeadline(signal))
    .maybeSingle();

  if (error) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data;
}

export async function readSessionById(
  sessionId: string,
  signal?: AbortSignal,
): Promise<GameSessionRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('game_sessions')
    .select(SESSION_COLUMNS)
    .eq('id', sessionId)
    .abortSignal(withReadDeadline(signal))
    .maybeSingle();

  if (error) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data;
}

export async function readPlayerById(
  playerId: string,
  signal?: AbortSignal,
): Promise<PlayerRow | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('players')
    .select(PLAYER_COLUMNS)
    .eq('id', playerId)
    .abortSignal(withReadDeadline(signal))
    .maybeSingle();

  if (error) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data;
}

export async function readSessionPlayers(
  sessionId: string,
  signal?: AbortSignal,
): Promise<Pick<PlayerRow, 'id' | 'name' | 'joined_at'>[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('players')
    .select('id,name,joined_at')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true })
    .order('id', { ascending: true })
    .abortSignal(withReadDeadline(signal));

  if (error) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data ?? [];
}

export async function readQuestionsByIds(
  questionIds: readonly string[],
  signal?: AbortSignal,
): Promise<QuestionRow[]> {
  if (questionIds.length === 0) return [];
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('questions')
    .select(QUESTION_COLUMNS)
    .in('id', [...questionIds])
    .abortSignal(withReadDeadline(signal));

  if (error) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data ?? [];
}

export async function readQuestionAnswers(
  sessionId: string,
  questionIndex: number,
  signal?: AbortSignal,
): Promise<AnswerRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('answers')
    .select(ANSWER_COLUMNS)
    .eq('session_id', sessionId)
    .eq('question_index', questionIndex)
    .abortSignal(withReadDeadline(signal));

  if (error) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data ?? [];
}

export async function readAllSessionAnswers(
  sessionId: string,
  signal?: AbortSignal,
): Promise<AnswerRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('answers')
    .select(ANSWER_COLUMNS)
    .eq('session_id', sessionId)
    .abortSignal(withReadDeadline(signal));

  if (error) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data ?? [];
}

export async function readCompletedSessions(
  limit = 30,
  signal?: AbortSignal,
): Promise<GameSessionRow[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('game_sessions')
    .select(SESSION_COLUMNS)
    .in('status', ['finished', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(limit)
    .abortSignal(withReadDeadline(signal));

  if (error) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  return data ?? [];
}
