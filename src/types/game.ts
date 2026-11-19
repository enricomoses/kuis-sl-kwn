import type { QuestionOption, QuestionType } from './question';

export type SessionStatus = 'lobby' | 'running' | 'finished' | 'cancelled';

export type GamePhase =
  'lobby' | 'countdown' | 'question' | 'reveal' | 'finished' | 'cancelled';

export type AdminSessionAction =
  'start' | 'close_question' | 'next' | 'finish' | 'cancel';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  name: string;
  totalScore: number;
  correctCount: number;
  totalCorrectMs: number;
}

export interface PlayMeResponse {
  player: {
    id: string;
    name: string;
  } | null;
  session: {
    id: string;
    status: SessionStatus;
    requiresPin: boolean;
    allowLateJoin: boolean;
  } | null;
}

export interface JoinRequest {
  name: string;
  pin?: string;
}

export interface JoinResponse {
  player: {
    id: string;
    name: string;
  };
  session: {
    id: string;
    status: SessionStatus;
  };
}

export interface AnswerRequest {
  questionIndex: number;
  optionId: string;
}

export interface AnswerResponse {
  accepted: true;
  alreadyAnswered: boolean;
}

interface PlayerStateBase {
  serverNow: string;
  version: number;
  session: {
    id: string;
    totalQuestions: number;
  };
  me: {
    id: string;
    name: string;
    totalScore: number;
    rank: number;
  };
}

export type PlayerState =
  | (PlayerStateBase & {
      phase: 'lobby';
      players: { id: string; name: string }[];
      playerCount: number;
    })
  | (PlayerStateBase & {
      phase: 'countdown' | 'question';
      questionIndex: number;
      question: {
        prompt: string;
        type: QuestionType;
        options: QuestionOption[];
        timeLimitSeconds: number;
      };
      startsAt: string;
      endsAt: string;
      myAnswer: { optionId: string } | null;
    })
  | (PlayerStateBase & {
      phase: 'reveal';
      questionIndex: number;
      question: {
        prompt: string;
        options: QuestionOption[];
        explanation: string | null;
      };
      correctOptionId: string;
      myResult: {
        optionId: string | null;
        isCorrect: boolean;
        points: number;
        responseMs: number | null;
      };
      distribution: Record<string, number>;
      leaderboard: LeaderboardEntry[];
      isLastQuestion: boolean;
    })
  | (PlayerStateBase & {
      phase: 'finished';
      leaderboard: LeaderboardEntry[];
    })
  | (PlayerStateBase & {
      phase: 'cancelled';
    });

export interface CreateSessionRequest {
  allowLateJoin: boolean;
  joinPin?: string | null;
}

export interface AdminSessionActionRequest {
  action: AdminSessionAction;
  expectedVersion: number;
}

export interface AdminGameState {
  serverNow: string;
  version: number;
  session: {
    id: string;
    status: SessionStatus;
    phase: GamePhase;
    currentIndex: number;
    totalQuestions: number;
    allowLateJoin: boolean;
    joinPin: string | null;
  };
  currentQuestion: {
    prompt: string;
    type: QuestionType;
    options: QuestionOption[];
    correctOptionId: string;
    explanation: string | null;
    timeLimitSeconds: number;
    startsAt: string;
    endsAt: string;
  } | null;
  players: {
    id: string;
    name: string;
    joinedAt: string;
  }[];
  answeredCount: number;
  distribution: Record<string, number> | null;
  leaderboard: LeaderboardEntry[];
}

export interface AdminLeaderboardState {
  serverNow: string;
  version: number;
  session: {
    id: string;
    status: SessionStatus;
    phase: GamePhase;
    currentIndex: number;
    totalQuestions: number;
  };
  playerCount: number;
  leaderboard: LeaderboardEntry[];
}

export interface SessionHistoryItem {
  id: string;
  status: 'finished' | 'cancelled';
  totalQuestions: number;
  playerCount: number;
  topPlayerName: string | null;
  topPlayerScore: number | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface SessionHistoryResponse {
  items: SessionHistoryItem[];
}

export interface QuestionStat {
  questionIndex: number;
  prompt: string;
  correctCount: number;
  totalAnswered: number;
  accuracyPercent: number;
  avgResponseMs: number | null;
}

export interface SessionResultsResponse {
  session: {
    id: string;
    status: SessionStatus;
    totalQuestions: number;
    createdAt: string;
    startedAt: string | null;
    finishedAt: string | null;
  };
  leaderboard: LeaderboardEntry[];
  questionStats: QuestionStat[];
}

export interface KickPlayerResponse {
  kicked: true;
  playerId: string;
}

type RealtimeHintKind =
  | 'session_opened'
  | 'session_closed'
  | 'state_changed'
  | 'players_changed'
  | 'answers_changed';

export interface RealtimeHint {
  kind: RealtimeHintKind;
  version: number;
}

export type RealtimeConnectionStatus =
  'SUBSCRIBED' | 'CONNECTING' | 'DISCONNECTED';
