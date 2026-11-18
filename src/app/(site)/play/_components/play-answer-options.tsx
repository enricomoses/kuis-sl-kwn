'use client';

import { AnswerOption } from '@/components/common/game/answer-option';
import type { AnswerOptionState } from '@/components/common/game/answer-option';
import { OPTION_LETTERS } from '@/constants/game.constant';
import type { QuestionOption } from '@/types/question';
import { cn } from '@/utils';

interface PlayAnswerOptionsProps {
  options: readonly QuestionOption[];
  selectedOptionId: string | null;
  disabled?: boolean;
  onSelect: (optionId: string) => void;
  className?: string;
}

export function PlayAnswerOptions({
  options,
  selectedOptionId,
  disabled = false,
  onSelect,
  className,
}: PlayAnswerOptionsProps) {
  return (
    <div
      className={cn('flex flex-col gap-3', className)}
      role="group"
      aria-label="Pilihan jawaban"
    >
      {options.map((option, index) => {
        const letter = OPTION_LETTERS[index] ?? String(index + 1);
        let state: AnswerOptionState = 'idle';
        if (selectedOptionId !== null) {
          state = selectedOptionId === option.id ? 'selected' : 'disabled';
        } else if (disabled) {
          state = 'disabled';
        }

        return (
          <AnswerOption
            key={option.id}
            letter={letter}
            text={option.text}
            state={state}
            disabled={disabled || selectedOptionId !== null}
            onSelect={() => onSelect(option.id)}
          />
        );
      })}
    </div>
  );
}
