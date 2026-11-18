'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GAME_COPY } from '@/constants/game.constant';
import { cn } from '@/utils';

interface PlayCountdownPanelProps {
  questionNumber: number;
  totalQuestions: number;
  remainingSeconds: number;
  className?: string;
}

export function PlayCountdownPanel({
  questionNumber,
  totalQuestions,
  remainingSeconds,
  className,
}: PlayCountdownPanelProps) {
  const displayNumber = Math.max(1, remainingSeconds);

  return (
    <Card
      tone="blue"
      className={cn(
        'flex flex-col items-center gap-4 py-10 text-center',
        className,
      )}
    >
      <Badge tone="solid-blue">{GAME_COPY.COUNTDOWN_BADGE}</Badge>
      <h1
        tabIndex={-1}
        data-phase-heading="true"
        className="m-0 text-2xl font-bold text-[var(--color-navy)]"
      >
        Soal {questionNumber} dari {totalQuestions}
      </h1>
      <div className="countdown-hero" aria-hidden="true">
        {displayNumber}
      </div>
      <p className="m-0 max-w-sm text-sm font-medium text-[var(--color-navy-muted)]">
        {GAME_COPY.COUNTDOWN_HINT}
      </p>
    </Card>
  );
}
