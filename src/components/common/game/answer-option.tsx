import { Check, X } from 'lucide-react';
import { cn } from '@/utils';

export type AnswerOptionState =
  'idle' | 'selected' | 'correct' | 'wrong' | 'disabled';

interface AnswerOptionProps {
  letter: string;
  text: string;
  state: AnswerOptionState;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
}

export function AnswerOption({
  letter,
  text,
  state,
  onSelect,
  disabled = false,
  className,
}: AnswerOptionProps) {
  const isDisabled = disabled || state !== 'idle';

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onSelect}
      aria-pressed={state === 'selected' || undefined}
      className={cn(
        'answer-option',
        state !== 'idle' && `answer-option--${state}`,
        className,
      )}
    >
      <span className="answer-option-key" aria-hidden="true">
        {letter}
      </span>
      <span className="flex-1 leading-snug">{text}</span>
      {state === 'correct' ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold uppercase">
          <Check size={20} aria-hidden="true" />
          <span>Benar</span>
        </span>
      ) : null}
      {state === 'wrong' ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold uppercase">
          <X size={20} aria-hidden="true" />
          <span>Salah</span>
        </span>
      ) : null}
      {state === 'selected' ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold uppercase">
          <Check size={18} aria-hidden="true" />
          <span>Dipilih</span>
        </span>
      ) : null}
    </button>
  );
}
