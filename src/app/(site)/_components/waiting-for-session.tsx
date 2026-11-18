import { Clock } from 'lucide-react';
import { ConnectionBadge } from '@/components/common/game/connection-badge';
import { Card } from '@/components/ui/card';
import { GAME_COPY } from '@/constants/game.constant';
import type { RealtimeConnectionStatus } from '@/types/game';
import { cn } from '@/utils';

interface WaitingForSessionProps {
  connectionStatus: RealtimeConnectionStatus;
  className?: string;
}

export function WaitingForSession({
  connectionStatus,
  className,
}: WaitingForSessionProps) {
  return (
    <Card
      tone="blue"
      className={cn('flex flex-col gap-2', className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-blue)]">
          <Clock size={18} aria-hidden="true" />
          <span>{GAME_COPY.WAITING_FOR_SESSION_TITLE}</span>
        </span>
        <ConnectionBadge status={connectionStatus} />
      </div>
      <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
        {GAME_COPY.WAITING_FOR_SESSION_DESC}
      </p>
    </Card>
  );
}
