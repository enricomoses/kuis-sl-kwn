'use client';

import { Eye, EyeOff } from 'lucide-react';
import { LeaderboardList } from '@/components/common/game/leaderboard-list';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { LeaderboardEntry } from '@/types/game';
import { cn } from '@/utils';

interface AdminLiveLeaderboardProps {
  entries: readonly LeaderboardEntry[];
  hideScores: boolean;
  onToggleHideScores: () => void;
  onKickPlayer?: (player: { id: string; name: string }) => void;
  className?: string;
}

export function AdminLiveLeaderboard({
  entries,
  hideScores,
  onToggleHideScores,
  onKickPlayer,
  className,
}: AdminLiveLeaderboardProps) {
  return (
    <Card tone="cream" className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="quiz-kicker quiz-kicker--blue">LIVE TOP 10</span>
          <h2 className="m-0 text-lg font-bold text-[var(--color-navy)]">
            Leaderboard
          </h2>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleHideScores}
          aria-pressed={hideScores}
        >
          {hideScores ? (
            <>
              <Eye size={16} aria-hidden="true" />
              <span>Tampilkan skor</span>
            </>
          ) : (
            <>
              <EyeOff size={16} aria-hidden="true" />
              <span>Sembunyikan skor</span>
            </>
          )}
        </Button>
      </div>

      <LeaderboardList
        entries={entries}
        hideScores={hideScores}
        onKickPlayer={onKickPlayer}
        compact
      />
    </Card>
  );
}
