import { z } from 'zod';
import { GAME_LIMITS } from '@/constants/game.constant';
import { questionOptionSchema, questionTypeSchema } from './question.schema';

const NAME_REGEX = /^[\p{L}\p{N} .'_-]{2,24}$/u;
const PIN_REGEX = /^\d{4}$/;

const sessionStatusSchema = z.enum([
  'lobby',
  'running',
  'finished',
  'cancelled',
]);

const gamePhaseSchema = z.enum([
  'lobby',
  'countdown',
  'question',
  'reveal',
  'finished',
  'cancelled',
]);

const adminSessionActionTypeSchema = z.enum([
  'start',
  'close_question',
  'next',
  'finish',
  'cancel',
]);

export const joinRequestSchema = z.strictObject({
  name: z
    .string()
    .transform((raw) => raw.trim().replace(/\s+/g, ' '))
    .refine(
      (val) =>
        val.length >= GAME_LIMITS.NAME_MIN &&
        val.length <= GAME_LIMITS.NAME_MAX,
      `Nama harus terdiri dari ${GAME_LIMITS.NAME_MIN}–${GAME_LIMITS.NAME_MAX} karakter.`,
    )
    .refine(
      (val) => NAME_REGEX.test(val),
      "Nama hanya boleh berisi huruf, angka, spasi, atau karakter . ' _ -",
    ),
  pin: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || PIN_REGEX.test(v),
      'PIN harus berupa 4 digit angka.',
    ),
});

export const answerRequestSchema = z.strictObject({
  questionIndex: z.int().min(0),
  optionId: z.string().trim().min(1).max(32),
});

const leaderboardEntrySchema = z.strictObject({
  rank: z.int().positive(),
  playerId: z.uuid(),
  name: z.string(),
  totalScore: z.int().min(0),
  correctCount: z.int().min(0),
  totalCorrectMs: z.int().min(0),
});

export const playMeSchema = z.strictObject({
  player: z
    .strictObject({
      id: z.uuid(),
      name: z.string(),
    })
    .nullable(),
  session: z
    .strictObject({
      id: z.uuid(),
      status: sessionStatusSchema,
      requiresPin: z.boolean(),
      allowLateJoin: z.boolean(),
    })
    .nullable(),
});

export const joinResponseSchema = z.strictObject({
  player: z.strictObject({
    id: z.uuid(),
    name: z.string(),
  }),
  session: z.strictObject({
    id: z.uuid(),
    status: sessionStatusSchema,
  }),
});

export const answerResponseSchema = z.strictObject({
  accepted: z.literal(true),
  alreadyAnswered: z.boolean(),
});

const playerStateBaseFields = {
  serverNow: z.iso.datetime({ offset: true }),
  version: z.int().min(0),
  session: z.strictObject({
    id: z.uuid(),
    totalQuestions: z.int().positive(),
  }),
  me: z.strictObject({
    id: z.uuid(),
    name: z.string(),
    totalScore: z.int().min(0),
    rank: z.int().positive(),
  }),
};

const activeQuestionForPlayerSchema = z.strictObject({
  prompt: z.string(),
  type: questionTypeSchema,
  options: z.array(questionOptionSchema),
  timeLimitSeconds: z.int().positive(),
});

export const playerStateSchema = z.discriminatedUnion('phase', [
  z.strictObject({
    ...playerStateBaseFields,
    phase: z.literal('lobby'),
    players: z.array(
      z.strictObject({
        id: z.uuid(),
        name: z.string(),
      }),
    ),
    playerCount: z.int().min(0),
  }),
  z.strictObject({
    ...playerStateBaseFields,
    phase: z.literal('countdown'),
    questionIndex: z.int().min(0),
    question: activeQuestionForPlayerSchema,
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
    myAnswer: z.strictObject({ optionId: z.string() }).nullable(),
  }),
  z.strictObject({
    ...playerStateBaseFields,
    phase: z.literal('question'),
    questionIndex: z.int().min(0),
    question: activeQuestionForPlayerSchema,
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
    myAnswer: z.strictObject({ optionId: z.string() }).nullable(),
  }),
  z.strictObject({
    ...playerStateBaseFields,
    phase: z.literal('reveal'),
    questionIndex: z.int().min(0),
    question: z.strictObject({
      prompt: z.string(),
      options: z.array(questionOptionSchema),
      explanation: z.string().nullable(),
    }),
    correctOptionId: z.string(),
    myResult: z.strictObject({
      optionId: z.string().nullable(),
      isCorrect: z.boolean(),
      points: z.int().min(0),
      responseMs: z.int().min(0).nullable(),
    }),
    distribution: z.record(z.string(), z.int().min(0)),
    leaderboard: z.array(leaderboardEntrySchema),
    isLastQuestion: z.boolean(),
  }),
  z.strictObject({
    ...playerStateBaseFields,
    phase: z.literal('finished'),
    leaderboard: z.array(leaderboardEntrySchema),
  }),
  z.strictObject({
    ...playerStateBaseFields,
    phase: z.literal('cancelled'),
  }),
]);

export const createSessionSchema = z.strictObject({
  allowLateJoin: z.boolean().default(false),
  joinPin: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine(
      (v) => v === null || PIN_REGEX.test(v),
      'PIN sesi harus terdiri dari tepat 4 digit angka.',
    ),
});

export const adminSessionActionSchema = z.strictObject({
  action: adminSessionActionTypeSchema,
  expectedVersion: z.int().min(0),
});

export const adminGameStateSchema = z.strictObject({
  serverNow: z.iso.datetime({ offset: true }),
  version: z.int().min(0),
  session: z.strictObject({
    id: z.uuid(),
    status: sessionStatusSchema,
    phase: gamePhaseSchema,
    currentIndex: z.int(),
    totalQuestions: z.int().positive(),
    allowLateJoin: z.boolean(),
    joinPin: z.string().nullable(),
  }),
  currentQuestion: z
    .strictObject({
      prompt: z.string(),
      type: questionTypeSchema,
      options: z.array(questionOptionSchema),
      correctOptionId: z.string(),
      explanation: z.string().nullable(),
      timeLimitSeconds: z.int().positive(),
      startsAt: z.iso.datetime({ offset: true }),
      endsAt: z.iso.datetime({ offset: true }),
    })
    .nullable(),
  players: z.array(
    z.strictObject({
      id: z.uuid(),
      name: z.string(),
      joinedAt: z.string(),
    }),
  ),
  answeredCount: z.int().min(0),
  distribution: z.record(z.string(), z.int().min(0)).nullable(),
  leaderboard: z.array(leaderboardEntrySchema),
});

export const adminGameStateNullableSchema = adminGameStateSchema.nullable();

export const adminLeaderboardStateSchema = z.strictObject({
  serverNow: z.iso.datetime({ offset: true }),
  version: z.int().min(0),
  session: z.strictObject({
    id: z.uuid(),
    status: sessionStatusSchema,
    phase: gamePhaseSchema,
    currentIndex: z.int(),
    totalQuestions: z.int().positive(),
  }),
  playerCount: z.int().min(0),
  leaderboard: z.array(leaderboardEntrySchema),
});

export const adminLeaderboardStateNullableSchema =
  adminLeaderboardStateSchema.nullable();

export const kickPlayerResponseSchema = z.strictObject({
  kicked: z.literal(true),
  playerId: z.uuid(),
});

const sessionHistoryItemSchema = z.strictObject({
  id: z.uuid(),
  status: z.enum(['finished', 'cancelled']),
  totalQuestions: z.int().positive(),
  playerCount: z.int().min(0),
  topPlayerName: z.string().nullable(),
  topPlayerScore: z.int().min(0).nullable(),
  createdAt: z.string(),
  startedAt: z.string().nullable(),
  finishedAt: z.string().nullable(),
});

export const sessionHistoryResponseSchema = z.strictObject({
  items: z.array(sessionHistoryItemSchema),
});

const questionStatSchema = z.strictObject({
  questionIndex: z.int().min(0),
  prompt: z.string(),
  correctCount: z.int().min(0),
  totalAnswered: z.int().min(0),
  accuracyPercent: z.number().min(0).max(100),
  avgResponseMs: z.int().min(0).nullable(),
});

export const sessionResultsResponseSchema = z.strictObject({
  session: z.strictObject({
    id: z.uuid(),
    status: sessionStatusSchema,
    totalQuestions: z.int().positive(),
    createdAt: z.string(),
    startedAt: z.string().nullable(),
    finishedAt: z.string().nullable(),
  }),
  leaderboard: z.array(leaderboardEntrySchema),
  questionStats: z.array(questionStatSchema),
});
