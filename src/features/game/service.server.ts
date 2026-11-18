import 'server-only';

import { z } from 'zod';
import { GAME_LIMITS } from '@/constants/game.constant';
import { REALTIME_CHANNELS } from '@/constants/realtime.constant';
import { publishHint } from '@/features/realtime/publisher.server';
import type {
  AdminGameState,
  AdminSessionActionRequest,
  CreateSessionRequest,
  KickPlayerResponse,
  LeaderboardEntry,
  PlayerState,
  QuestionStat,
  SessionHistoryItem,
  SessionHistoryResponse,
  SessionResultsResponse,
} from '@/types/game';
import { buildLeaderboardCsv } from '@/utils/csv';
import { resolvePhase } from '@/utils/game-phase';
import {
  adminGameStateSchema,
  playerStateSchema,
  sessionHistoryResponseSchema,
  sessionResultsResponseSchema,
} from '@/validations/game.schema';
import { questionOptionSchema } from '@/validations/question.schema';
import { GameError } from './errors.server';
import {
  readActiveSession,
  readAllSessionAnswers,
  readCompletedSessions,
  readQuestionAnswers,
  readQuestionsByIds,
  readSessionById,
  readSessionPlayers,
  rpcAdvanceSession,
  rpcCreateSession,
  rpcGetDbNow,
  rpcGetLeaderboard,
  rpcKickPlayer,
} from './repository.server';
import type {
  AnswerRow,
  GameSessionRow,
  LeaderboardRpcRow,
  PlayerRow,
  QuestionRow,
} from './repository.server';

function parseOptions(raw: unknown) {
  return z.array(questionOptionSchema).parse(raw);
}

function mapLeaderboard(
  rows: readonly LeaderboardRpcRow[],
): LeaderboardEntry[] {
  return rows.map((row) => ({
    rank: row.rank,
    playerId: row.player_id,
    name: row.name,
    totalScore: row.total_score,
    correctCount: row.correct_count,
    totalCorrectMs: Number(row.total_correct_ms),
  }));
}

function computeDistribution(
  options: readonly { id: string }[],
  answers: readonly AnswerRow[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const option of options) {
    counts[option.id] = 0;
  }
  for (const answer of answers) {
    counts[answer.selected_option_id] =
      (counts[answer.selected_option_id] ?? 0) + 1;
  }
  return counts;
}

export interface BuildPlayerStateInput {
  session: GameSessionRow;
  player: Pick<PlayerRow, 'id' | 'name' | 'total_score'>;
  players: readonly Pick<PlayerRow, 'id' | 'name'>[];
  currentQuestion: QuestionRow | null;
  questionAnswers: readonly AnswerRow[];
  leaderboard: readonly LeaderboardRpcRow[];
  serverNowIso: string;
}

/**
 * Pure state builder for player payloads.
 * Strictly validated via `playerStateSchema` so `correctOptionId` can NEVER leak before `reveal`.
 */
export function buildPlayerState(input: BuildPlayerStateInput): PlayerState {
  const nowMs = Date.parse(input.serverNowIso);
  const phase = resolvePhase(
    {
      status: input.session.status,
      questionStartedAt: input.session.question_started_at,
      questionEndsAt: input.session.question_ends_at,
      questionClosedAt: input.session.question_closed_at,
    },
    nowMs,
  );

  const mappedLeaderboard = mapLeaderboard(input.leaderboard);
  const myRank =
    mappedLeaderboard.find((entry) => entry.playerId === input.player.id)
      ?.rank ?? 1;

  const base = {
    serverNow: input.serverNowIso,
    version: input.session.state_version,
    session: {
      id: input.session.id,
      totalQuestions: input.session.total_questions,
    },
    me: {
      id: input.player.id,
      name: input.player.name,
      totalScore: input.player.total_score,
      rank: myRank,
    },
  };

  if (phase === 'lobby') {
    return playerStateSchema.parse({
      ...base,
      phase: 'lobby',
      players: input.players.map((p) => ({ id: p.id, name: p.name })),
      playerCount: input.players.length,
    });
  }

  if (phase === 'finished') {
    return playerStateSchema.parse({
      ...base,
      phase: 'finished',
      leaderboard: mappedLeaderboard,
    });
  }

  if (phase === 'cancelled') {
    return playerStateSchema.parse({
      ...base,
      phase: 'cancelled',
    });
  }

  const question = input.currentQuestion;
  if (!question) {
    throw new GameError('UPSTREAM_ERROR', 503);
  }
  const options = parseOptions(question.options);
  const myAnswerRow = input.questionAnswers.find(
    (ans) => ans.player_id === input.player.id,
  );

  if (phase === 'countdown' || phase === 'question') {
    if (!input.session.question_started_at || !input.session.question_ends_at) {
      throw new GameError('UPSTREAM_ERROR', 503);
    }
    return playerStateSchema.parse({
      ...base,
      phase,
      questionIndex: input.session.current_index,
      question: {
        prompt: question.prompt,
        type: question.type,
        options,
        timeLimitSeconds: question.time_limit_seconds,
      },
      startsAt: input.session.question_started_at,
      endsAt: input.session.question_ends_at,
      myAnswer: myAnswerRow
        ? { optionId: myAnswerRow.selected_option_id }
        : null,
    });
  }

  // phase === 'reveal'
  return playerStateSchema.parse({
    ...base,
    phase: 'reveal',
    questionIndex: input.session.current_index,
    question: {
      prompt: question.prompt,
      options,
      explanation: question.explanation,
    },
    correctOptionId: question.correct_option_id,
    myResult: {
      optionId: myAnswerRow ? myAnswerRow.selected_option_id : null,
      isCorrect: myAnswerRow ? myAnswerRow.is_correct : false,
      points: myAnswerRow ? myAnswerRow.points : 0,
      responseMs: myAnswerRow ? myAnswerRow.response_ms : null,
    },
    distribution: computeDistribution(options, input.questionAnswers),
    leaderboard: mappedLeaderboard.slice(
      0,
      GAME_LIMITS.LEADERBOARD_REVEAL_SIZE,
    ),
    isLastQuestion:
      input.session.current_index >= input.session.total_questions - 1,
  });
}

export interface BuildAdminGameStateInput {
  session: GameSessionRow;
  players: readonly Pick<PlayerRow, 'id' | 'name' | 'joined_at'>[];
  currentQuestion: QuestionRow | null;
  questionAnswers: readonly AnswerRow[];
  leaderboard: readonly LeaderboardRpcRow[];
  serverNowIso: string;
}

export function buildAdminGameState(
  input: BuildAdminGameStateInput,
): AdminGameState {
  const nowMs = Date.parse(input.serverNowIso);
  const phase = resolvePhase(
    {
      status: input.session.status,
      questionStartedAt: input.session.question_started_at,
      questionEndsAt: input.session.question_ends_at,
      questionClosedAt: input.session.question_closed_at,
    },
    nowMs,
  );

  const mappedLeaderboard = mapLeaderboard(input.leaderboard);
  const leaderboard =
    phase === 'finished'
      ? mappedLeaderboard
      : mappedLeaderboard.slice(0, GAME_LIMITS.LEADERBOARD_LIVE_SIZE);

  let currentQuestionPayload: AdminGameState['currentQuestion'] = null;
  let distribution: Record<string, number> | null = null;

  if (
    input.currentQuestion &&
    input.session.question_started_at &&
    input.session.question_ends_at &&
    (phase === 'countdown' || phase === 'question' || phase === 'reveal')
  ) {
    const options = parseOptions(input.currentQuestion.options);
    currentQuestionPayload = {
      prompt: input.currentQuestion.prompt,
      type: input.currentQuestion.type,
      options,
      correctOptionId: input.currentQuestion.correct_option_id,
      explanation: input.currentQuestion.explanation,
      timeLimitSeconds: input.currentQuestion.time_limit_seconds,
      startsAt: input.session.question_started_at,
      endsAt: input.session.question_ends_at,
    };

    if (phase === 'reveal') {
      distribution = computeDistribution(options, input.questionAnswers);
    }
  }

  return adminGameStateSchema.parse({
    serverNow: input.serverNowIso,
    version: input.session.state_version,
    session: {
      id: input.session.id,
      status: input.session.status,
      phase,
      currentIndex: input.session.current_index,
      totalQuestions: input.session.total_questions,
      allowLateJoin: input.session.allow_late_join,
      joinPin: input.session.join_pin,
    },
    currentQuestion: currentQuestionPayload,
    players: input.players.map((p) => ({
      id: p.id,
      name: p.name,
      joinedAt: p.joined_at,
    })),
    answeredCount: input.questionAnswers.length,
    distribution,
    leaderboard,
  });
}

async function hydrateAdminGameState(
  session: GameSessionRow,
  signal?: AbortSignal,
): Promise<AdminGameState> {
  const questionId =
    session.current_index >= 0
      ? session.question_order[session.current_index]
      : undefined;

  const [players, leaderboard, questions, questionAnswers, serverNowIso] =
    await Promise.all([
      readSessionPlayers(session.id, signal),
      rpcGetLeaderboard(session.id, undefined, signal),
      questionId
        ? readQuestionsByIds([questionId], signal)
        : Promise.resolve([]),
      session.current_index >= 0
        ? readQuestionAnswers(session.id, session.current_index, signal)
        : Promise.resolve([]),
      rpcGetDbNow(signal),
    ]);

  return buildAdminGameState({
    session,
    players,
    currentQuestion: questions[0] ?? null,
    questionAnswers,
    leaderboard,
    serverNowIso,
  });
}

export async function getAdminActiveGameState(
  signal?: AbortSignal,
): Promise<AdminGameState | null> {
  const active = await readActiveSession(signal);
  if (!active) return null;
  return hydrateAdminGameState(active, signal);
}

export async function createAdminGameSession(
  createdBy: string,
  input: CreateSessionRequest,
  requestId: string,
  signal?: AbortSignal,
): Promise<AdminGameState> {
  const created = await rpcCreateSession(
    {
      createdBy,
      allowLateJoin: input.allowLateJoin,
      joinPin: input.joinPin ?? null,
    },
    signal,
  );

  await publishHint(
    REALTIME_CHANNELS.LOBBY,
    { kind: 'session_opened', version: created.state_version },
    requestId,
  );

  return hydrateAdminGameState(created, signal);
}

export async function performAdminGameAction(
  sessionId: string,
  input: AdminSessionActionRequest,
  requestId: string,
  signal?: AbortSignal,
): Promise<AdminGameState> {
  const updated = await rpcAdvanceSession(
    {
      sessionId,
      expectedVersion: input.expectedVersion,
      action: input.action,
      leadInMs: GAME_LIMITS.QUESTION_LEAD_IN_MS,
    },
    signal,
  );

  const hint = {
    kind: 'state_changed' as const,
    version: updated.state_version,
  };

  const publishes: Promise<boolean>[] = [
    publishHint(REALTIME_CHANNELS.sessionPlayers(updated.id), hint, requestId),
    publishHint(REALTIME_CHANNELS.sessionAdmin(updated.id), hint, requestId),
  ];

  if (input.action === 'finish' || input.action === 'cancel') {
    publishes.push(
      publishHint(
        REALTIME_CHANNELS.LOBBY,
        { kind: 'session_closed', version: updated.state_version },
        requestId,
      ),
    );
  }

  await Promise.all(publishes);

  return hydrateAdminGameState(updated, signal);
}

export async function kickGamePlayer(
  sessionId: string,
  playerId: string,
  requestId: string,
  signal?: AbortSignal,
): Promise<KickPlayerResponse> {
  const result = await rpcKickPlayer(sessionId, playerId, signal);
  if (!result.deleted) {
    throw new GameError('NOT_FOUND', 404);
  }

  await Promise.all([
    publishHint(
      REALTIME_CHANNELS.sessionAdmin(sessionId),
      { kind: 'players_changed', version: result.state_version },
      requestId,
    ),
    publishHint(
      REALTIME_CHANNELS.sessionPlayers(sessionId),
      { kind: 'state_changed', version: result.state_version },
      requestId,
    ),
    ...(result.closed_early
      ? [
          publishHint(
            REALTIME_CHANNELS.sessionAdmin(sessionId),
            { kind: 'state_changed', version: result.state_version },
            requestId,
          ),
        ]
      : []),
  ]);

  return { kicked: true, playerId };
}

export async function listGameSessionHistory(
  signal?: AbortSignal,
): Promise<SessionHistoryResponse> {
  const sessions = await readCompletedSessions(30, signal);

  const items: SessionHistoryItem[] = await Promise.all(
    sessions.map(async (session) => {
      const [players, topLeaderboard] = await Promise.all([
        readSessionPlayers(session.id, signal),
        rpcGetLeaderboard(session.id, 1, signal),
      ]);
      const winner = topLeaderboard[0];
      return {
        id: session.id,
        status: session.status === 'finished' ? 'finished' : 'cancelled',
        totalQuestions: session.total_questions,
        playerCount: players.length,
        topPlayerName: winner?.name ?? null,
        topPlayerScore: winner?.total_score ?? null,
        createdAt: session.created_at,
        startedAt: session.started_at,
        finishedAt: session.finished_at,
      };
    }),
  );

  return sessionHistoryResponseSchema.parse({ items });
}

export async function getGameSessionResults(
  sessionId: string,
  signal?: AbortSignal,
): Promise<SessionResultsResponse> {
  const session = await readSessionById(sessionId, signal);
  if (!session) {
    throw new GameError('NOT_FOUND', 404);
  }

  const [leaderboardRows, questions, allAnswers] = await Promise.all([
    rpcGetLeaderboard(session.id, undefined, signal),
    readQuestionsByIds(session.question_order, signal),
    readAllSessionAnswers(session.id, signal),
  ]);

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const questionStats: QuestionStat[] = session.question_order.map(
    (questionId, index) => {
      const question = questionMap.get(questionId);
      const answers = allAnswers.filter((ans) => ans.question_index === index);
      const correctCount = answers.filter((ans) => ans.is_correct).length;
      const totalAnswered = answers.length;
      const accuracyPercent =
        totalAnswered > 0
          ? Math.round((correctCount / totalAnswered) * 1000) / 10
          : 0;
      const avgResponseMs =
        totalAnswered > 0
          ? Math.round(
              answers.reduce((sum, ans) => sum + ans.response_ms, 0) /
                totalAnswered,
            )
          : null;

      return {
        questionIndex: index,
        prompt: question?.prompt ?? `Soal #${index + 1}`,
        correctCount,
        totalAnswered,
        accuracyPercent,
        avgResponseMs,
      };
    },
  );

  return sessionResultsResponseSchema.parse({
    session: {
      id: session.id,
      status: session.status,
      totalQuestions: session.total_questions,
      createdAt: session.created_at,
      startedAt: session.started_at,
      finishedAt: session.finished_at,
    },
    leaderboard: mapLeaderboard(leaderboardRows),
    questionStats,
  });
}

export async function exportGameSessionCsv(
  sessionId: string,
  signal?: AbortSignal,
): Promise<{ filename: string; csv: string }> {
  const results = await getGameSessionResults(sessionId, signal);
  const dateTag = results.session.createdAt.slice(0, 10);
  const shortId = results.session.id.slice(0, 8);
  return {
    filename: `hasil-kuis-${dateTag}-${shortId}.csv`,
    csv: buildLeaderboardCsv(results.leaderboard),
  };
}
