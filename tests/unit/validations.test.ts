import { describe, expect, it } from 'vitest';
import {
  answerRequestSchema,
  joinRequestSchema,
  playerStateSchema,
} from '@/validations/game.schema';
import { questionFormSchema } from '@/validations/question.schema';
import { realtimeHintSchema } from '@/validations/realtime.schema';

describe('Zod validations', () => {
  it('normalizes whitespace and validates player join names & optional PIN', () => {
    const ok = joinRequestSchema.safeParse({
      name: '  Budi   Santoso  ',
      pin: '1234',
    });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.name).toBe('Budi Santoso');
      expect(ok.data.pin).toBe('1234');
    }

    expect(joinRequestSchema.safeParse({ name: 'A' }).success).toBe(false);
    expect(
      joinRequestSchema.safeParse({ name: '<script>alert(1)</script>' })
        .success,
    ).toBe(false);
    expect(
      joinRequestSchema.safeParse({ name: 'Sinta', pin: '12a4' }).success,
    ).toBe(false);
  });

  it('validates answer request schema', () => {
    expect(
      answerRequestSchema.safeParse({ questionIndex: 0, optionId: 'b' })
        .success,
    ).toBe(true);
    expect(
      answerRequestSchema.safeParse({ questionIndex: -1, optionId: 'b' })
        .success,
    ).toBe(false);
  });

  it('enforces questionFormSchema rules for true_false and multiple_choice', () => {
    const validTf = questionFormSchema.safeParse({
      type: 'true_false',
      prompt: 'Berbeda pendapat dengan sopan boleh dilakukan.',
      options: [
        { id: 'true', text: 'Benar' },
        { id: 'false', text: 'Salah' },
      ],
      correctOptionId: 'true',
      timeLimitSeconds: 20,
      basePoints: 1000,
    });
    expect(validTf.success).toBe(true);

    // Reject duplicate option text (case-insensitive)
    const dupMc = questionFormSchema.safeParse({
      type: 'multiple_choice',
      prompt: 'Pilih tindakan terbaik saat melihat ejekan.',
      options: [
        { id: 'a', text: 'Menegur sopan' },
        { id: 'b', text: 'menegur sopan' },
      ],
      correctOptionId: 'a',
      timeLimitSeconds: 30,
      basePoints: 1000,
    });
    expect(dupMc.success).toBe(false);

    // Reject invalid timeLimitSeconds not in TIME_LIMIT_CHOICES
    const badTime = questionFormSchema.safeParse({
      type: 'true_false',
      prompt: 'Contoh soal dengan durasi tidak standar.',
      options: [
        { id: 'true', text: 'Benar' },
        { id: 'false', text: 'Salah' },
      ],
      correctOptionId: 'false',
      timeLimitSeconds: 25,
      basePoints: 1000,
    });
    expect(badTime.success).toBe(false);
  });

  it('strictly rejects correctOptionId leaked into question phase PlayerState', () => {
    const leaked = playerStateSchema.safeParse({
      phase: 'question',
      serverNow: '2026-11-19T06:00:10.000Z',
      version: 2,
      session: {
        id: '11111111-1111-4111-8111-111111111111',
        totalQuestions: 5,
      },
      me: {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Budi',
        totalScore: 0,
        rank: 1,
      },
      questionIndex: 0,
      question: {
        prompt: 'Soal contoh keberagaman.',
        type: 'true_false',
        options: [
          { id: 'true', text: 'Benar' },
          { id: 'false', text: 'Salah' },
        ],
        timeLimitSeconds: 20,
      },
      startsAt: '2026-11-19T06:00:03.000Z',
      endsAt: '2026-11-19T06:00:23.000Z',
      myAnswer: null,
      correctOptionId: 'false',
    });

    expect(leaked.success).toBe(false);
  });

  it('rejects extra fields in realtimeHintSchema', () => {
    expect(
      realtimeHintSchema.safeParse({ kind: 'state_changed', version: 3 })
        .success,
    ).toBe(true);
    expect(
      realtimeHintSchema.safeParse({
        kind: 'state_changed',
        version: 3,
        extra: 'bad',
      }).success,
    ).toBe(false);
  });
});
