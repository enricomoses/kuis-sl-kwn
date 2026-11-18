import { Award, Medal, Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/game';
import { cn } from '@/utils';

interface PodiumProps {
  entries: readonly LeaderboardEntry[];
  className?: string;
}

export function Podium({ entries, className }: PodiumProps) {
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  if (!first) return null;

  return (
    <div className={cn('podium-grid', className)} aria-label="Podium 3 Besar">
      <div className="podium-slot min-h-[132px] justify-center">
        {second ? (
          <>
            <Medal
              size={24}
              className="text-[var(--color-blue)]"
              aria-hidden="true"
            />
            <span className="mt-1 text-xs font-bold tracking-wider text-[var(--color-blue)] uppercase">
              #2
            </span>
            <p className="m-0 mt-1 line-clamp-2 text-sm font-bold text-[var(--color-navy)]">
              {second.name}
            </p>
            <p className="m-0 mt-0.5 text-sm font-bold text-[var(--color-navy-muted)] tabular-nums">
              {second.totalScore.toLocaleString('id-ID')}
            </p>
          </>
        ) : (
          <span className="text-xs font-bold text-[var(--color-navy-muted)]">
            #2
          </span>
        )}
      </div>

      <div className="podium-slot podium-slot--first min-h-[168px] justify-center">
        <Trophy size={30} aria-hidden="true" />
        <span className="mt-1 text-xs font-bold tracking-wider uppercase opacity-90">
          Juara #1
        </span>
        <p className="m-0 mt-1 line-clamp-2 text-base font-bold">
          {first.name}
        </p>
        <p className="m-0 mt-0.5 text-lg font-bold tabular-nums">
          {first.totalScore.toLocaleString('id-ID')}
        </p>
      </div>

      <div className="podium-slot podium-slot--third min-h-[116px] justify-center">
        {third ? (
          <>
            <Award
              size={22}
              className="text-[var(--color-coral-ink)]"
              aria-hidden="true"
            />
            <span className="mt-1 text-xs font-bold tracking-wider text-[var(--color-coral-ink)] uppercase">
              #3
            </span>
            <p className="m-0 mt-1 line-clamp-2 text-sm font-bold text-[var(--color-navy)]">
              {third.name}
            </p>
            <p className="m-0 mt-0.5 text-sm font-bold text-[var(--color-coral-ink)] tabular-nums">
              {third.totalScore.toLocaleString('id-ID')}
            </p>
          </>
        ) : (
          <span className="text-xs font-bold text-[var(--color-coral-ink)]">
            #3
          </span>
        )}
      </div>
    </div>
  );
}
