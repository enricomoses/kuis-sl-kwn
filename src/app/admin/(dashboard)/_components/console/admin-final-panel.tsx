'use client';

import { Download, RotateCcw } from 'lucide-react';
import { LeaderboardList } from '@/components/common/game/leaderboard-list';
import { Podium } from '@/components/common/game/podium';
import { Badge } from '@/components/ui/badge';
import { Button, buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/constants/endpoint.constant';
import type { LeaderboardEntry } from '@/types/game';
import { cn } from '@/utils';

interface AdminFinalPanelProps {
  sessionId: string;
  leaderboard: readonly LeaderboardEntry[];
  onNewSession: () => void;
  className?: string;
}

export function AdminFinalPanel({
  sessionId,
  leaderboard,
  onNewSession,
  className,
}: AdminFinalPanelProps) {
  const exportUrl = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.ADMIN_GAME_EXPORT(sessionId)}`;

  return (
    <div
      className={cn('mx-auto flex w-full max-w-3xl flex-col gap-5', className)}
    >
      <Card
        tone="blue"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <Badge tone="solid-blue">SESI SELESAI</Badge>
          <h2 className="m-0 text-2xl font-bold text-[var(--color-navy)]">
            Papan Peringkat Final
          </h2>
          <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
            Total {leaderboard.length} peserta menyelesaikan sesi ini.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={exportUrl} className={buttonStyles('secondary', 'md')}>
            <Download size={18} aria-hidden="true" />
            <span>Ekspor CSV</span>
          </a>
          <Button variant="primary" onClick={onNewSession}>
            <RotateCcw size={18} aria-hidden="true" />
            <span>Sesi Baru</span>
          </Button>
        </div>
      </Card>

      <Podium entries={leaderboard} />

      <Card tone="cream" className="flex flex-col gap-3">
        <span className="quiz-kicker quiz-kicker--blue">
          SELURUH PESERTA (URUT SKOR TERTINGGI)
        </span>
        <LeaderboardList entries={leaderboard} />
      </Card>
    </div>
  );
}
