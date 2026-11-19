'use client';

import { KeyRound, Users } from 'lucide-react';
import { PlayerChip } from '@/components/common/game/player-chip';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils';

interface AdminLobbyPanelProps {
  totalQuestions: number;
  allowLateJoin: boolean;
  joinPin: string | null;
  players: readonly { id: string; name: string; joinedAt: string }[];
  onKickRequest: (player: { id: string; name: string }) => void;
  className?: string;
}

export function AdminLobbyPanel({
  totalQuestions,
  allowLateJoin,
  joinPin,
  players,
  onKickRequest,
  className,
}: AdminLobbyPanelProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Card className="admin-panel flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="quiz-kicker quiz-kicker--blue">
            RUANG TUNGGU AKTIF
          </span>
          <h2 className="m-0 text-xl font-bold tracking-[-0.02em] text-[var(--color-navy)] sm:text-2xl">
            Siap Menerima Pemain
          </h2>
          <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
            {totalQuestions} soal disiapkan ·{' '}
            {allowLateJoin
              ? 'Late join diizinkan'
              : 'Pendaftaran terkunci setelah mulai'}
          </p>
        </div>

        {joinPin ? (
          <div className="rounded-xl border border-[rgba(36,73,216,0.16)] bg-[#f4f7ff] px-5 py-3 text-center">
            <span className="inline-flex items-center gap-1 text-xs font-bold tracking-wider text-[var(--color-blue)] uppercase">
              <KeyRound size={13} aria-hidden="true" />
              <span>PIN Sesi</span>
            </span>
            <div className="admin-pin-display">{joinPin}</div>
          </div>
        ) : null}
      </Card>

      <Card className="admin-panel flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-base font-bold text-[var(--color-navy)]">
            <Users size={18} aria-hidden="true" />
            <span>Daftar Pemain ({players.length})</span>
          </span>
          <Badge tone={players.length > 0 ? 'blue' : 'neutral'}>
            {players.length > 0 ? 'Siap dimulai' : 'Menunggu minimal 1 pemain'}
          </Badge>
        </div>

        {players.length === 0 ? (
          <p className="m-0 rounded-xl border border-dashed border-[rgba(23,35,59,0.14)] bg-[#faf8f4] px-4 py-8 text-center text-sm font-medium text-[var(--color-navy-muted)]">
            Belum ada pemain bergabung. Minta siswa membuka halaman beranda dan
            memasukkan nama.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {players.map((player) => (
              <PlayerChip
                key={player.id}
                name={player.name}
                onKick={() =>
                  onKickRequest({ id: player.id, name: player.name })
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
