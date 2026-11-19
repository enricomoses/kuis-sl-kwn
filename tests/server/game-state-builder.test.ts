import { describe, expect, it } from 'vitest';
import type {
  AnswerRow,
  GameSessionRow,
  LeaderboardRpcRow,
  QuestionRow,
} from '@/features/game/repository.server';
import {
  buildAdminGameState,
  buildAdminLeaderboardState,
  buildPlayerState,
} from '@/features/game/service.server';

const SESSION_ID = '11111111-1111-4111-8111-111111111111';
const QUESTION_ID = '22222222-2222-4222-8222-222222222222';
const PLAYER_ID = '33333333-3333-4333-8333-333333333333';

const sampleQuestion: QuestionRow = {
  id: QUESTION_ID,
  type: 'true_false',
  prompt: 'Berbeda pendapat dengan sopan boleh dilakukan.',
  options: [
    { id: 'true', text: 'Benar' },
    { id: 'false', text: 'Salah' },
  ],
  correct_option_id: 'true',
  explanation: 'Berbeda pendapat adalah hal wajar selama disampaikan sopan.',
  time_limit_seconds: 20,
  base_points: 1000,
  position: 1,
  archived_at: null,
  created_at: '2026-11-19T05:00:00.000Z',
  updated_at: '2026-11-19T05:00:00.000Z',
};

const sampleSession: GameSessionRow = {
  id: SESSION_ID,
  status: 'running',
  question_order: [QUESTION_ID],
  total_questions: 1,
  current_index: 0,
  question_started_at: '2026-11-19T06:00:03.000Z',
  question_ends_at: '2026-11-19T06:00:23.000Z',
  question_closed_at: null,
  allow_late_join: false,
  join_pin: null,
  state_version: 2,
  created_by: null,
  created_at: '2026-11-19T06:00:00.000Z',
  started_at: '2026-11-19T06:00:00.000Z',
  finished_at: null,
};

const sampleLeaderboard: LeaderboardRpcRow[] = [
  {
    rank: 1,
    player_id: PLAYER_ID,
    name: 'Budi',
    total_score: 925,
    correct_count: 1,
    total_correct_ms: 3000,
    joined_at: '2026-11-19T06:00:00.000Z',
  },
];

const sampleAnswers: AnswerRow[] = [
  {
    id: '44444444-4444-4444-8444-444444444444',
    session_id: SESSION_ID,
    player_id: PLAYER_ID,
    question_id: QUESTION_ID,
    question_index: 0,
    selected_option_id: 'true',
    is_correct: true,
    response_ms: 3000,
    points: 925,
    answered_at: '2026-11-19T06:00:06.000Z',
  },
];

describe('game state builders (PRD §11.3 & §19)', () => {
  it('never exposes correctOptionId to players during countdown or question phase', () => {
    const countdownState = buildPlayerState({
      session: sampleSession,
      player: { id: PLAYER_ID, name: 'Budi', total_score: 0 },
      players: [{ id: PLAYER_ID, name: 'Budi' }],
      currentQuestion: sampleQuestion,
      questionAnswers: [],
      leaderboard: sampleLeaderboard,
      serverNowIso: '2026-11-19T06:00:01.000Z',
    });

    expect(countdownState.phase).toBe('countdown');
    expect('correctOptionId' in countdownState).toBe(false);

    const questionState = buildPlayerState({
      session: sampleSession,
      player: { id: PLAYER_ID, name: 'Budi', total_score: 0 },
      players: [{ id: PLAYER_ID, name: 'Budi' }],
      currentQuestion: sampleQuestion,
      questionAnswers: sampleAnswers,
      leaderboard: sampleLeaderboard,
      serverNowIso: '2026-11-19T06:00:10.000Z',
    });

    expect(questionState.phase).toBe('question');
    expect('correctOptionId' in questionState).toBe(false);
    if (questionState.phase === 'question') {
      expect(questionState.myAnswer).toEqual({ optionId: 'true' });
    }
  });

  it('includes correctOptionId, points, explanation, and distribution on reveal phase', () => {
    const revealState = buildPlayerState({
      session: sampleSession,
      player: { id: PLAYER_ID, name: 'Budi', total_score: 925 },
      players: [{ id: PLAYER_ID, name: 'Budi' }],
      currentQuestion: sampleQuestion,
      questionAnswers: sampleAnswers,
      leaderboard: sampleLeaderboard,
      serverNowIso: '2026-11-19T06:00:25.000Z',
    });

    expect(revealState.phase).toBe('reveal');
    if (revealState.phase === 'reveal') {
      expect(revealState.correctOptionId).toBe('true');
      expect(revealState.myResult.points).toBe(925);
      expect(revealState.distribution).toEqual({ true: 1, false: 0 });
      expect(revealState.question.explanation).toBe(sampleQuestion.explanation);
    }
  });

  it('builds AdminGameState with distribution only during reveal', () => {
    const activeAdmin = buildAdminGameState({
      session: sampleSession,
      players: [
        {
          id: PLAYER_ID,
          name: 'Budi',
          joined_at: '2026-11-19T06:00:00.000Z',
        },
      ],
      currentQuestion: sampleQuestion,
      questionAnswers: sampleAnswers,
      leaderboard: sampleLeaderboard,
      serverNowIso: '2026-11-19T06:00:10.000Z',
    });
    expect(activeAdmin.session.phase).toBe('question');
    expect(activeAdmin.distribution).toBeNull();
    expect(activeAdmin.currentQuestion?.correctOptionId).toBe('true');

    const revealAdmin = buildAdminGameState({
      session: sampleSession,
      players: [
        {
          id: PLAYER_ID,
          name: 'Budi',
          joined_at: '2026-11-19T06:00:00.000Z',
        },
      ],
      currentQuestion: sampleQuestion,
      questionAnswers: sampleAnswers,
      leaderboard: sampleLeaderboard,
      serverNowIso: '2026-11-19T06:00:25.000Z',
    });
    expect(revealAdmin.session.phase).toBe('reveal');
    expect(revealAdmin.distribution).toEqual({ true: 1, false: 0 });
  });

  it('builds projection-safe AdminLeaderboardState without question or answer key fields', () => {
    const state = buildAdminLeaderboardState({
      session: sampleSession,
      leaderboard: sampleLeaderboard,
      serverNowIso: '2026-11-19T06:00:10.000Z',
    });

    expect(state.session.phase).toBe('question');
    expect(state.playerCount).toBe(1);
    expect(state.leaderboard[0]?.name).toBe('Budi');
    expect('currentQuestion' in state).toBe(false);
    expect('correctOptionId' in state).toBe(false);
    expect('joinPin' in state.session).toBe(false);
  });
});
