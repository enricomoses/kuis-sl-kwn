'use client';

import { CountdownBar } from '@/components/common/game/countdown-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackBanner } from '@/components/ui/feedback';
import type { AnswerRequest } from '@/types/game';
import type { QuestionOption } from '@/types/question';
import { cn } from '@/utils';
import { PlayAnswerOptions } from './play-answer-options';
import { PlayWaitingPanel } from './play-waiting-panel';

interface PlayQuestionPanelProps {
  questionNumber: number;
  totalQuestions: number;
  prompt: string;
  options: readonly QuestionOption[];
  timeLimitSeconds: number;
  remainingMs: number;
  remainingSeconds: number;
  selectedOptionId: string | null;
  isSubmitting: boolean;
  failedSubmission: AnswerRequest | null;
  onSelectOption: (optionId: string) => void;
  onRetrySubmit: () => void;
  className?: string;
}

export function PlayQuestionPanel({
  questionNumber,
  totalQuestions,
  prompt,
  options,
  timeLimitSeconds,
  remainingMs,
  remainingSeconds,
  selectedOptionId,
  isSubmitting,
  failedSubmission,
  onSelectOption,
  onRetrySubmit,
  className,
}: PlayQuestionPanelProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <Card className="flex flex-col gap-4">
        <CountdownBar
          remainingMs={remainingMs}
          totalSeconds={timeLimitSeconds}
          remainingSeconds={remainingSeconds}
          label={`Soal ${questionNumber} dari ${totalQuestions}`}
        />

        <h1
          tabIndex={-1}
          data-phase-heading="true"
          className="m-0 text-xl leading-snug font-bold text-[var(--color-navy)] sm:text-2xl"
        >
          {prompt}
        </h1>
      </Card>

      {failedSubmission ? (
        <FeedbackBanner
          tone="error"
          action={
            <Button
              variant="danger"
              size="sm"
              loading={isSubmitting}
              onClick={onRetrySubmit}
            >
              Kirim Ulang
            </Button>
          }
        >
          Jawaban belum terkirim karena koneksi terganggu.
        </FeedbackBanner>
      ) : null}

      <PlayAnswerOptions
        options={options}
        selectedOptionId={selectedOptionId}
        disabled={isSubmitting || remainingMs <= 0}
        onSelect={onSelectOption}
      />

      {selectedOptionId ? <PlayWaitingPanel /> : null}
    </section>
  );
}
