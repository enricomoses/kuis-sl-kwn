'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { LeaderboardEntry } from '@/types/game';
import { cn } from '@/utils';

interface LeaderboardListProps {
  entries: readonly LeaderboardEntry[];
  highlightPlayerId?: string;
  compact?: boolean;
  hideScores?: boolean;
  autoScrollHighlight?: boolean;
  onKickPlayer?: (player: { id: string; name: string }) => void;
  className?: string;
}

export function LeaderboardList({
  entries,
  highlightPlayerId,
  compact = false,
  hideScores = false,
  autoScrollHighlight = false,
  onKickPlayer,
  className,
}: LeaderboardListProps) {
  const highlightedRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!autoScrollHighlight || !highlightPlayerId) return;
    if (typeof highlightedRef.current?.scrollIntoView === 'function') {
      highlightedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [autoScrollHighlight, highlightPlayerId]);

  if (entries.length === 0) {
    return (
      <p className="m-0 text-sm text-[var(--color-navy-muted)]">
        Belum ada skor tercatat.
      </p>
    );
  }

  return (
    <ol className={cn('leaderboard-list', className)}>
      {entries.map((entry) => {
        const isHighlighted =
          Boolean(highlightPlayerId) && entry.playerId === highlightPlayerId;
        return (
          <li
            key={entry.playerId}
            ref={isHighlighted ? highlightedRef : undefined}
            aria-current={isHighlighted ? 'true' : undefined}
            className={cn(
              'leaderboard-row',
              isHighlighted && 'leaderboard-row--highlight',
              compact && 'px-3 py-2 text-sm',
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums',
                  entry.rank === 1
                    ? 'bg-[var(--color-blue)] text-[var(--color-white)]'
                    : 'bg-[var(--color-cream-strong)] text-[var(--color-navy)]',
                )}
              >
                {entry.rank}
              </span>
              <span className="truncate font-bold text-[var(--color-navy)]">
                {entry.name}
                {isHighlighted ? (
                  <span className="ml-1.5 text-xs font-bold text-[var(--color-blue)]">
                    (Kamu)
                  </span>
                ) : null}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3 tabular-nums">
              {!compact ? (
                <span className="text-xs font-medium text-[var(--color-navy-muted)]">
                  {entry.correctCount} benar
                </span>
              ) : null}
              <span className="font-bold text-[var(--color-navy)]">
                {hideScores ? '•••' : entry.totalScore.toLocaleString('id-ID')}
              </span>
              {onKickPlayer ? (
                <button
                  type="button"
                  onClick={() =>
                    onKickPlayer({ id: entry.playerId, name: entry.name })
                  }
                  aria-label={`Keluarkan ${entry.name}`}
                  className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[var(--color-coral-tint)] text-[var(--color-coral-ink)] hover:bg-[var(--color-coral)] hover:text-[var(--color-navy)]"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
