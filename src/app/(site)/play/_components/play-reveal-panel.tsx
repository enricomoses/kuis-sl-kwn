'use client';

import { Check, Clock, X } from 'lucide-react';
import { AnswerOption } from '@/components/common/game/answer-option';
import type { AnswerOptionState } from '@/components/common/game/answer-option';
import { DistributionBars } from '@/components/common/game/distribution-bars';
import { LeaderboardList } from '@/components/common/game/leaderboard-list';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GAME_COPY, OPTION_LETTERS } from '@/constants/game.constant';
import type { LeaderboardEntry } from '@/types/game';
import type { QuestionOption } from '@/types/question';
import { cn } from '@/utils';

interface PlayRevealPanelProps {
  questionNumber: number;
  totalQuestions: number;
  prompt: string;
  options: readonly QuestionOption[];
  explanation: string | null;
  correctOptionId: string;
  myResult: {
    optionId: string | null;
    isCorrect: boolean;
    points: number;
    responseMs: number | null;
  };
  myRank: number;
  myPlayerId: string;
  myTotalScore: number;
  distribution: Record<string, number>;
  leaderboard: readonly LeaderboardEntry[];
  isLastQuestion: boolean;
  className?: string;
}

export function PlayRevealPanel({
  questionNumber,
  totalQuestions,
  prompt,
  options,
  explanation,
  correctOptionId,
  myResult,
  myRank,
  myPlayerId,
  myTotalScore,
  distribution,
  leaderboard,
  isLastQuestion,
  className,
}: PlayRevealPanelProps) {
  const resultTone = myResult.isCorrect ? 'blue' : 'coral';

  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <Card tone={resultTone} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone={myResult.isCorrect ? 'solid-blue' : 'coral'}>
            {myResult.isCorrect ? (
              <>
                <Check size={14} aria-hidden="true" />
                <span>{GAME_COPY.REVEAL_CORRECT_BADGE}</span>
              </>
            ) : myResult.optionId ? (
              <>
                <X size={14} aria-hidden="true" />
                <span>{GAME_COPY.REVEAL_WRONG_BADGE}</span>
              </>
            ) : (
              <>
                <Clock size={14} aria-hidden="true" />
                <span>{GAME_COPY.REVEAL_UNANSWERED_BADGE}</span>
              </>
            )}
          </Badge>
          <span className="text-sm font-bold text-[var(--color-navy)]">
            Soal {questionNumber} dari {totalQuestions}
          </span>
        </div>

        <h1
          tabIndex={-1}
          data-phase-heading="true"
          className="m-0 text-2xl font-bold text-[var(--color-navy)] tabular-nums"
        >
          {myResult.isCorrect
            ? `+${myResult.points.toLocaleString('id-ID')} poin`
            : '+0 poin'}
        </h1>

        <p className="m-0 text-sm font-semibold text-[var(--color-navy-muted)]">
          Peringkatmu: <strong>#{myRank}</strong> · Total skor:{' '}
          <strong>{myTotalScore.toLocaleString('id-ID')}</strong>
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="m-0 text-base font-bold text-[var(--color-navy)]">
          {prompt}
        </p>

        <div className="flex flex-col gap-2">
          {options.map((option, index) => {
            const letter = OPTION_LETTERS[index] ?? String(index + 1);
            let state: AnswerOptionState = 'disabled';
            if (option.id === correctOptionId) {
              state = 'correct';
            } else if (myResult.optionId === option.id && !myResult.isCorrect) {
              state = 'wrong';
            }

            return (
              <AnswerOption
                key={option.id}
                letter={letter}
                text={option.text}
                state={state}
                disabled
              />
            );
          })}
        </div>

        {explanation ? (
          <div className="mt-1 rounded-xl bg-[var(--color-cream)] p-3.5">
            <span className="quiz-kicker quiz-kicker--blue">
              {GAME_COPY.REVEAL_EXPLANATION_LABEL}
            </span>
            <p className="m-0 mt-1 text-sm leading-relaxed font-medium text-[var(--color-navy)]">
              {explanation}
            </p>
          </div>
        ) : null}
      </Card>

      <Card className="flex flex-col gap-3">
        <span className="quiz-kicker quiz-kicker--blue">
          {GAME_COPY.REVEAL_DISTRIBUTION_LABEL}
        </span>
        <DistributionBars
          options={options}
          distribution={distribution}
          correctOptionId={correctOptionId}
        />
      </Card>

      <Card tone="cream" className="flex flex-col gap-3">
        <span className="quiz-kicker quiz-kicker--blue">
          {GAME_COPY.REVEAL_TOP_LEADERBOARD_LABEL}
        </span>
        <LeaderboardList
          entries={leaderboard}
          highlightPlayerId={myPlayerId}
          compact
        />
        <p className="m-0 text-center text-sm font-medium text-[var(--color-navy-muted)]">
          {isLastQuestion
            ? 'Menunggu admin menampilkan hasil akhir…'
            : 'Menunggu admin melanjutkan ke soal berikutnya…'}
        </p>
      </Card>
    </section>
  );
}
