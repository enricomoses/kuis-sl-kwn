'use client';

import { Users } from 'lucide-react';
import { PlayerChip } from '@/components/common/game/player-chip';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GAME_COPY } from '@/constants/game.constant';
import { cn } from '@/utils';

interface PlayLobbyPanelProps {
  meId: string;
  meName: string;
  players: readonly { id: string; name: string }[];
  playerCount: number;
  className?: string;
}

export function PlayLobbyPanel({
  meId,
  meName,
  players,
  playerCount,
  className,
}: PlayLobbyPanelProps) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <Card className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone="blue">{GAME_COPY.LOBBY_BADGE}</Badge>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-navy)]">
            <Users size={16} aria-hidden="true" />
            <span>{playerCount} pemain</span>
          </span>
        </div>

        <h1
          tabIndex={-1}
          data-phase-heading="true"
          className="m-0 text-2xl font-bold text-[var(--color-navy)]"
        >
          Kamu masuk sebagai{' '}
          <span className="text-[var(--color-blue)]">{meName}</span>
        </h1>

        <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
          {GAME_COPY.LOBBY_WAITING_ADMIN}
        </p>
      </Card>

      <Card tone="blue" className="flex flex-col gap-3">
        <span className="quiz-kicker quiz-kicker--blue">
          Pemain yang sudah bergabung
        </span>
        <div className="flex flex-wrap gap-2">
          {players.map((player) => (
            <PlayerChip
              key={player.id}
              name={player.name}
              highlight={player.id === meId}
            />
          ))}
        </div>
      </Card>
    </section>
  );
}
