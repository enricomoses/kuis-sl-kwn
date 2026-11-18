import 'server-only';

import { REALTIME_CHANNELS } from '@/constants/realtime.constant';
import { GameError } from '@/features/game/errors.server';
import {
  readActiveSession,
  readPlayerById,
  readQuestionAnswers,
  readQuestionsByIds,
  readSessionById,
  readSessionPlayers,
  rpcGetDbNow,
  rpcGetLeaderboard,
  rpcJoinSession,
  rpcSubmitAnswer,
} from '@/features/game/repository.server';
import { buildPlayerState } from '@/features/game/service.server';
import { publishHint } from '@/features/realtime/publisher.server';
import type {
  AnswerRequest,
  AnswerResponse,
  JoinRequest,
  JoinResponse,
  PlayMeResponse,
  PlayerState,
} from '@/types/game';
import {
  answerResponseSchema,
  joinResponseSchema,
  playMeSchema,
} from '@/validations/game.schema';
import {
  generatePlayerToken,
  hashPlayerToken,
  readPlayerCookie,
  verifyPlayerTokenHash,
} from './identity.server';

async function authenticatePlayer(signal?: AbortSignal) {
  const cookie = await readPlayerCookie();
  if (!cookie) {
    throw new GameError('NOT_JOINED', 401);
  }

  const player = await readPlayerById(cookie.playerId, signal);
  if (!player) {
    throw new GameError('NOT_JOINED', 401);
  }

  if (!verifyPlayerTokenHash(cookie.token, player.token_hash)) {
    throw new GameError('NOT_JOINED', 401);
  }

  return player;
}

export async function getPlayMe(signal?: AbortSignal): Promise<PlayMeResponse> {
  const [activeSession, cookie] = await Promise.all([
    readActiveSession(signal),
    readPlayerCookie(),
  ]);

  let verifiedPlayer: { id: string; name: string } | null = null;

  if (cookie && activeSession) {
    const player = await readPlayerById(cookie.playerId, signal);
    if (
      player &&
      player.session_id === activeSession.id &&
      verifyPlayerTokenHash(cookie.token, player.token_hash)
    ) {
      verifiedPlayer = { id: player.id, name: player.name };
    }
  }

  return playMeSchema.parse({
    player: verifiedPlayer,
    session: activeSession
      ? {
          id: activeSession.id,
          status: activeSession.status,
          requiresPin: activeSession.join_pin !== null,
          allowLateJoin: activeSession.allow_late_join,
        }
      : null,
  });
}

export async function joinActiveSession(
  input: JoinRequest,
  requestId: string,
  signal?: AbortSignal,
): Promise<{
  data: JoinResponse;
  playerId: string;
  token: string;
}> {
  const token = generatePlayerToken();
  const tokenHash = hashPlayerToken(token);

  const joined = await rpcJoinSession(
    {
      name: input.name,
      tokenHash,
      pin: input.pin ?? null,
    },
    signal,
  );

  await publishHint(
    REALTIME_CHANNELS.sessionAdmin(joined.session_id),
    { kind: 'players_changed', version: joined.state_version },
    requestId,
  );

  return {
    data: joinResponseSchema.parse({
      player: {
        id: joined.player_id,
        name: joined.player_name,
      },
      session: {
        id: joined.session_id,
        status: joined.session_status,
      },
    }),
    playerId: joined.player_id,
    token,
  };
}

export async function getPlayerGameState(
  signal?: AbortSignal,
): Promise<PlayerState> {
  const player = await authenticatePlayer(signal);
  const session = await readSessionById(player.session_id, signal);
  if (!session) {
    throw new GameError('NO_ACTIVE_SESSION', 404);
  }

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

  return buildPlayerState({
    session,
    player,
    players,
    currentQuestion: questions[0] ?? null,
    questionAnswers,
    leaderboard,
    serverNowIso,
  });
}

export async function submitPlayerAnswer(
  input: AnswerRequest,
  requestId: string,
  signal?: AbortSignal,
): Promise<AnswerResponse> {
  const player = await authenticatePlayer(signal);

  const result = await rpcSubmitAnswer(
    {
      sessionId: player.session_id,
      playerId: player.id,
      questionIndex: input.questionIndex,
      optionId: input.optionId,
    },
    signal,
  );

  const latestSession = await readSessionById(player.session_id, signal);
  const version = latestSession?.state_version ?? 0;

  const publishes: Promise<boolean>[] = [
    publishHint(
      REALTIME_CHANNELS.sessionAdmin(player.session_id),
      { kind: 'answers_changed', version },
      requestId,
    ),
  ];

  if (result.closed_early) {
    publishes.push(
      publishHint(
        REALTIME_CHANNELS.sessionPlayers(player.session_id),
        { kind: 'state_changed', version },
        requestId,
      ),
      publishHint(
        REALTIME_CHANNELS.sessionAdmin(player.session_id),
        { kind: 'state_changed', version },
        requestId,
      ),
    );
  }

  await Promise.all(publishes);

  return answerResponseSchema.parse({
    accepted: true,
    alreadyAnswered: result.already_answered,
  });
}
