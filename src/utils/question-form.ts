import { GAME_LIMITS } from '@/constants/game.constant';
import type {
  AdminQuestion,
  QuestionFormInput,
  QuestionOption,
  QuestionType,
} from '@/types/question';

const MULTIPLE_CHOICE_IDS = ['a', 'b', 'c', 'd'] as const;

export function createTrueFalseOptions(): QuestionOption[] {
  return [
    { id: 'true', text: 'Benar' },
    { id: 'false', text: 'Salah' },
  ];
}

export function createMultipleChoiceOptions(count = 3): QuestionOption[] {
  const clamped = Math.min(
    GAME_LIMITS.OPTIONS_MAX,
    Math.max(GAME_LIMITS.OPTIONS_MIN, count),
  );
  return MULTIPLE_CHOICE_IDS.slice(0, clamped).map((id) => ({
    id,
    text: '',
  }));
}

export function createDefaultQuestionForm(
  type: QuestionType = 'true_false',
): QuestionFormInput {
  const options =
    type === 'true_false'
      ? createTrueFalseOptions()
      : createMultipleChoiceOptions(3);
  return {
    type,
    prompt: '',
    options,
    correctOptionId: options[0].id,
    explanation: '',
    timeLimitSeconds: GAME_LIMITS.DEFAULT_TIME_LIMIT_S,
    basePoints: GAME_LIMITS.DEFAULT_BASE_POINTS,
  };
}

export function questionToFormInput(
  question: AdminQuestion,
): QuestionFormInput {
  return {
    type: question.type,
    prompt: question.prompt,
    options: question.options.map((opt) => ({ id: opt.id, text: opt.text })),
    correctOptionId: question.correctOptionId,
    explanation: question.explanation ?? '',
    timeLimitSeconds: question.timeLimitSeconds,
    basePoints: question.basePoints,
  };
}

export function nextMultipleChoiceOptionId(
  existing: readonly QuestionOption[],
): string | null {
  const used = new Set(existing.map((opt) => opt.id));
  for (const candidate of MULTIPLE_CHOICE_IDS) {
    if (!used.has(candidate)) return candidate;
  }
  return null;
}
