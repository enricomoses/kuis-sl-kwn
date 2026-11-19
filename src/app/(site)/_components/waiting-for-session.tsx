import { Clock } from 'lucide-react';
import { GAME_COPY } from '@/constants/game.constant';
import { cn } from '@/utils';

interface WaitingForSessionProps {
  className?: string;
}

export function WaitingForSession({ className }: WaitingForSessionProps) {
  return (
    <div
      className={cn(
        'auth-card-footer flex flex-col gap-1 px-6 py-4 sm:px-8',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--color-navy)]">
        <Clock
          size={15}
          className="shrink-0 text-[var(--color-blue)]"
          aria-hidden="true"
        />
        <span>{GAME_COPY.WAITING_FOR_SESSION_TITLE}</span>
      </span>
      <p className="m-0 text-xs leading-snug text-[var(--color-navy-muted)]">
        {GAME_COPY.WAITING_FOR_SESSION_DESC}
      </p>
    </div>
  );
}
