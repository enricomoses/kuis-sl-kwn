'use client';

import Link from 'next/link';
import { LeaderboardList } from '@/components/common/game/leaderboard-list';
import { Podium } from '@/components/common/game/podium';
import { Badge } from '@/components/ui/badge';
import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GAME_COPY } from '@/constants/game.constant';
import { ROUTES } from '@/constants/routes.constant';
import type { LeaderboardEntry } from '@/types/game';
import { cn } from '@/utils';

interface PlayFinishedPanelProps {
  myPlayerId: string;
  myRank: number;
  myTotalScore: number;
  leaderboard: readonly LeaderboardEntry[];
  className?: string;
}

export function PlayFinishedPanel({
  myPlayerId,
  myRank,
  myTotalScore,
  leaderboard,
  className,
}: PlayFinishedPanelProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <Card tone="blue" className="flex flex-col gap-2 text-center">
        <div className="flex justify-center">
          <Badge tone="solid-blue">{GAME_COPY.FINISHED_BADGE}</Badge>
        </div>
        <h1
          tabIndex={-1}
          data-phase-heading="true"
          className="m-0 text-2xl font-bold text-[var(--color-navy)] sm:text-3xl"
        >
          {GAME_COPY.FINISHED_TITLE}
        </h1>
        <p className="m-0 text-base font-semibold text-[var(--color-navy-muted)]">
          Posisi akhirmu: <strong>#{myRank}</strong> · Skor:{' '}
          <strong>{myTotalScore.toLocaleString('id-ID')}</strong>
        </p>
      </Card>

      <Podium entries={leaderboard} />

      <Card tone="cream" className="flex flex-col gap-3">
        <span className="quiz-kicker quiz-kicker--blue">
          Daftar Peringkat Lengkap
        </span>
        <LeaderboardList
          entries={leaderboard}
          highlightPlayerId={myPlayerId}
          autoScrollHighlight
        />
      </Card>

      <Link
        href={ROUTES.HOME}
        className={buttonStyles('secondary', 'lg', 'w-full')}
      >
        {GAME_COPY.FINISHED_BACK_HOME}
      </Link>
    </section>
  );
}
