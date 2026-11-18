import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { GAME_COPY } from '@/constants/game.constant';
import { cn } from '@/utils';

interface PlayWaitingPanelProps {
  className?: string;
}

export function PlayWaitingPanel({ className }: PlayWaitingPanelProps) {
  return (
    <Card
      tone="blue"
      role="status"
      aria-live="polite"
      className={cn('flex items-center gap-3', className)}
    >
      <CheckCircle2
        size={24}
        className="shrink-0 text-[var(--color-blue)]"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-0.5">
        <p className="m-0 text-base font-bold text-[var(--color-navy)]">
          {GAME_COPY.ANSWER_SUBMITTED_TITLE}
        </p>
        <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
          {GAME_COPY.ANSWER_SUBMITTED_DESC}
        </p>
      </div>
    </Card>
  );
}
