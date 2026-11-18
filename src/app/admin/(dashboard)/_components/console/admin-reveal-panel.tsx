'use client';

import { DistributionBars } from '@/components/common/game/distribution-bars';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GAME_COPY } from '@/constants/game.constant';
import type { QuestionOption } from '@/types/question';
import { cn } from '@/utils';

interface AdminRevealPanelProps {
  questionNumber: number;
  totalQuestions: number;
  prompt: string;
  options: readonly QuestionOption[];
  correctOptionId: string;
  explanation: string | null;
  distribution: Record<string, number>;
  answeredCount: number;
  totalPlayers: number;
  className?: string;
}

export function AdminRevealPanel({
  questionNumber,
  totalQuestions,
  prompt,
  options,
  correctOptionId,
  explanation,
  distribution,
  answeredCount,
  totalPlayers,
  className,
}: AdminRevealPanelProps) {
  return (
    <Card className={cn('flex flex-col gap-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge tone="solid-blue">
            Soal {questionNumber} / {totalQuestions}
          </Badge>
          <Badge tone="blue">Pembahasan (Reveal)</Badge>
        </div>
        <span className="text-sm font-bold text-[var(--color-navy-muted)]">
          Menjawab: {answeredCount} / {totalPlayers}
        </span>
      </div>

      <h2 className="m-0 text-2xl leading-snug font-bold text-[var(--color-navy)]">
        {prompt}
      </h2>

      <DistributionBars
        options={options}
        distribution={distribution}
        correctOptionId={correctOptionId}
      />

      {explanation ? (
        <div className="rounded-xl bg-[var(--color-blue-tint)] p-4">
          <span className="quiz-kicker quiz-kicker--blue">
            {GAME_COPY.REVEAL_EXPLANATION_LABEL}
          </span>
          <p className="m-0 mt-1 text-base leading-relaxed font-medium text-[var(--color-navy)]">
            {explanation}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
