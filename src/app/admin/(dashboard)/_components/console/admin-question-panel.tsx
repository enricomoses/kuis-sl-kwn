'use client';

import { Check, Users } from 'lucide-react';
import { CountdownBar } from '@/components/common/game/countdown-bar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { OPTION_LETTERS, PHASE_LABELS } from '@/constants/game.constant';
import type { GamePhase } from '@/types/game';
import type { QuestionOption } from '@/types/question';
import { cn } from '@/utils';

interface AdminQuestionPanelProps {
  phase: Extract<GamePhase, 'countdown' | 'question'>;
  questionNumber: number;
  totalQuestions: number;
  prompt: string;
  options: readonly QuestionOption[];
  correctOptionId: string;
  timeLimitSeconds: number;
  remainingMs: number;
  remainingSeconds: number;
  answeredCount: number;
  totalPlayers: number;
  className?: string;
}

export function AdminQuestionPanel({
  phase,
  questionNumber,
  totalQuestions,
  prompt,
  options,
  correctOptionId,
  timeLimitSeconds,
  remainingMs,
  remainingSeconds,
  answeredCount,
  totalPlayers,
  className,
}: AdminQuestionPanelProps) {
  return (
    <Card className={cn('admin-panel flex flex-col gap-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge tone="solid-blue">
            Soal {questionNumber} / {totalQuestions}
          </Badge>
          <Badge tone="blue">{PHASE_LABELS[phase]}</Badge>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-navy)]">
          <Users size={16} aria-hidden="true" />
          <span>
            Sudah menjawab: {answeredCount} / {totalPlayers}
          </span>
        </span>
      </div>

      {phase === 'countdown' ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-[var(--color-blue-tint)] py-6 text-center">
          <span className="quiz-kicker quiz-kicker--blue">
            HITUNG MUNDUR PEMBUKA
          </span>
          <div className="countdown-hero">{Math.max(1, remainingSeconds)}</div>
        </div>
      ) : (
        <CountdownBar
          remainingMs={remainingMs}
          totalSeconds={timeLimitSeconds}
          remainingSeconds={remainingSeconds}
          label="Sisa waktu menjawab"
        />
      )}

      <h2 className="m-0 text-2xl leading-snug font-bold text-[var(--color-navy)]">
        {prompt}
      </h2>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((option, index) => {
          const letter = OPTION_LETTERS[index] ?? String(index + 1);
          const isCorrect = option.id === correctOptionId;
          return (
            <div
              key={option.id}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold',
                isCorrect
                  ? 'bg-[var(--color-blue-tint)] text-[var(--color-navy)] ring-2 ring-[var(--color-blue)]'
                  : 'bg-[var(--color-cream)] text-[var(--color-navy)]',
              )}
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-white)] text-sm font-bold text-[var(--color-blue)]">
                {letter}
              </span>
              <span className="flex-1">{option.text}</span>
              {isCorrect ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--color-blue)] uppercase">
                  <Check size={16} aria-hidden="true" />
                  <span>Kunci</span>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-bold tracking-wider text-[var(--color-navy-muted)] uppercase">
          <span>Progres Jawaban Masuk</span>
          <span>
            {answeredCount} / {totalPlayers}
          </span>
        </div>
        <ProgressBar
          value={answeredCount}
          max={Math.max(1, totalPlayers)}
          label="Progres pemain yang sudah menjawab"
        />
      </div>
    </Card>
  );
}
