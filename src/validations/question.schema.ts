import { z } from 'zod';
import { GAME_LIMITS } from '@/constants/game.constant';

const TIME_LIMIT_SET = new Set<number>(GAME_LIMITS.TIME_LIMIT_CHOICES);

export const questionTypeSchema = z.enum(['multiple_choice', 'true_false']);

export const questionOptionSchema = z.strictObject({
  id: z
    .string()
    .trim()
    .min(1, 'ID opsi wajib diisi.')
    .max(32, 'ID opsi terlalu panjang.')
    .regex(/^[a-z0-9_-]+$/i, 'ID opsi hanya boleh huruf, angka, _ atau -.'),
  text: z
    .string()
    .trim()
    .min(1, 'Teks opsi wajib diisi.')
    .max(
      GAME_LIMITS.OPTION_TEXT_MAX,
      `Teks opsi maksimal ${GAME_LIMITS.OPTION_TEXT_MAX} karakter.`,
    ),
});

function validateQuestionRules(
  data: {
    type: 'multiple_choice' | 'true_false';
    options: { id: string; text: string }[];
    correctOptionId: string;
    timeLimitSeconds: number;
  },
  ctx: z.RefinementCtx,
) {
  if (!TIME_LIMIT_SET.has(data.timeLimitSeconds)) {
    ctx.addIssue({
      code: 'custom',
      path: ['timeLimitSeconds'],
      message: 'Pilih durasi waktu yang tersedia.',
    });
  }

  if (data.type === 'true_false') {
    if (data.options.length !== 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message:
          'Soal Benar/Salah harus memiliki tepat 2 opsi (Benar & Salah).',
      });
    } else {
      const ids = data.options.map((o) => o.id);
      if (ids[0] !== 'true' || ids[1] !== 'false') {
        ctx.addIssue({
          code: 'custom',
          path: ['options'],
          message: 'Opsi soal Benar/Salah harus ber-ID "true" dan "false".',
        });
      }
      if (
        data.options[0].text !== 'Benar' ||
        data.options[1].text !== 'Salah'
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['options'],
          message: 'Label soal Benar/Salah harus "Benar" dan "Salah".',
        });
      }
    }
  } else if (
    data.options.length < GAME_LIMITS.OPTIONS_MIN ||
    data.options.length > GAME_LIMITS.OPTIONS_MAX
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['options'],
      message: `Pilihan ganda harus memiliki ${GAME_LIMITS.OPTIONS_MIN}–${GAME_LIMITS.OPTIONS_MAX} opsi.`,
    });
  }

  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();
  data.options.forEach((opt, idx) => {
    const idKey = opt.id.toLowerCase();
    if (seenIds.has(idKey)) {
      ctx.addIssue({
        code: 'custom',
        path: ['options', idx, 'id'],
        message: 'ID opsi tidak boleh duplikat.',
      });
    }
    seenIds.add(idKey);

    const textKey = opt.text.trim().toLowerCase();
    if (seenTexts.has(textKey)) {
      ctx.addIssue({
        code: 'custom',
        path: ['options', idx, 'text'],
        message: 'Teks opsi jawaban tidak boleh sama.',
      });
    }
    seenTexts.add(textKey);
  });

  if (!data.options.some((opt) => opt.id === data.correctOptionId)) {
    ctx.addIssue({
      code: 'custom',
      path: ['correctOptionId'],
      message: 'Kunci jawaban harus merujuk ke salah satu opsi yang ada.',
    });
  }
}

const questionFields = {
  type: questionTypeSchema,
  prompt: z
    .string()
    .trim()
    .min(
      GAME_LIMITS.PROMPT_MIN,
      `Pertanyaan minimal ${GAME_LIMITS.PROMPT_MIN} karakter.`,
    )
    .max(
      GAME_LIMITS.PROMPT_MAX,
      `Pertanyaan maksimal ${GAME_LIMITS.PROMPT_MAX} karakter.`,
    ),
  options: z
    .array(questionOptionSchema)
    .min(GAME_LIMITS.OPTIONS_MIN)
    .max(GAME_LIMITS.OPTIONS_MAX),
  correctOptionId: z.string().trim().min(1, 'Pilih jawaban benar.'),
  explanation: z
    .string()
    .trim()
    .max(
      GAME_LIMITS.EXPLANATION_MAX,
      `Penjelasan maksimal ${GAME_LIMITS.EXPLANATION_MAX} karakter.`,
    )
    .nullable()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  timeLimitSeconds: z.int(),
  basePoints: z
    .int()
    .min(GAME_LIMITS.BASE_POINTS_MIN)
    .max(GAME_LIMITS.BASE_POINTS_MAX),
};

export const questionFormSchema = z
  .strictObject(questionFields)
  .superRefine(validateQuestionRules);

export const updateQuestionSchema = z
  .strictObject({
    ...questionFields,
    expectedUpdatedAt: z.iso.datetime({ offset: true }),
  })
  .superRefine(validateQuestionRules);

export const reorderQuestionsSchema = z.strictObject({
  orderedIds: z.array(z.uuid()).min(1).max(200),
});

export const adminQuestionSchema = z.strictObject({
  id: z.uuid(),
  type: questionTypeSchema,
  prompt: z.string(),
  options: z.array(questionOptionSchema),
  correctOptionId: z.string(),
  explanation: z.string().nullable(),
  timeLimitSeconds: z.int(),
  basePoints: z.int(),
  position: z.int(),
  updatedAt: z.string(),
});

export const adminQuestionListResponseSchema = z.strictObject({
  items: z.array(adminQuestionSchema),
  locked: z.boolean(),
});

export const archiveQuestionResponseSchema = z.strictObject({
  archived: z.literal(true),
  id: z.uuid(),
});
