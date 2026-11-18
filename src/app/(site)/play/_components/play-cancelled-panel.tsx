import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GAME_COPY } from '@/constants/game.constant';
import { ROUTES } from '@/constants/routes.constant';
import { cn } from '@/utils';

interface PlayCancelledPanelProps {
  className?: string;
}

export function PlayCancelledPanel({ className }: PlayCancelledPanelProps) {
  return (
    <Card
      tone="coral"
      className={cn('flex flex-col items-start gap-4', className)}
    >
      <Badge tone="coral">{GAME_COPY.CANCELLED_BADGE}</Badge>
      <h1
        tabIndex={-1}
        data-phase-heading="true"
        className="m-0 text-2xl font-bold text-[var(--color-navy)]"
      >
        {GAME_COPY.CANCELLED_TITLE}
      </h1>
      <p className="m-0 text-sm font-medium text-[var(--color-coral-ink)]">
        {GAME_COPY.CANCELLED_DESC}
      </p>
      <Link href={ROUTES.HOME} className={buttonStyles('primary', 'md')}>
        {GAME_COPY.FINISHED_BACK_HOME}
      </Link>
    </Card>
  );
}
