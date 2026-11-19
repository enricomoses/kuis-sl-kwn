'use client';

import { Trophy, Users } from 'lucide-react';
import { ErrorState } from '@/components/common/feedback/error-state';
import { AdminLeaderboardSkeleton } from '@/components/common/feedback/page-skeletons';
import { LeaderboardList } from '@/components/common/game/leaderboard-list';
import { Podium } from '@/components/common/game/podium';
import { PartnerLogos } from '@/components/common/layout/partner-logos';
import { Badge } from '@/components/ui/badge';
import { APP_INFO } from '@/constants/app.constant';
import { useAdminLeaderboard } from '@/hooks/use-admin-leaderboard';
import type { AdminSessionProfile } from '@/types/auth';
import type { AdminLeaderboardState } from '@/types/game';
import { cn } from '@/utils';

interface AdminLeaderboardViewProps {
  profile: AdminSessionProfile;
  initialState: AdminLeaderboardState | null;
  className?: string;
}

function getSessionStatusSummary(state: AdminLeaderboardState): string {
  const participants = `${state.playerCount} peserta`;

  if (state.session.phase === 'finished') {
    return `Hasil Akhir · ${participants}`;
  }
  if (state.session.phase === 'lobby') {
    return `Ruang Tunggu · ${participants}`;
  }
  const current = Math.min(
    state.session.totalQuestions,
    Math.max(1, state.session.currentIndex + 1),
  );
  return `Soal ${current} dari ${state.session.totalQuestions} · ${participants}`;
}

export function AdminLeaderboardView({
  profile,
  initialState,
  className,
}: AdminLeaderboardViewProps) {
  const { state, isLoading, isError, refetch } = useAdminLeaderboard(
    profile,
    initialState,
  );

  if (isLoading && !state) {
    return <AdminLeaderboardSkeleton />;
  }

  return (
    <main
      className={cn(
        'mx-auto flex min-h-dvh w-full max-w-[820px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10',
        className,
      )}
    >
      <header className="flex flex-col items-center gap-4 text-center">
        <PartnerLogos size="sm" />

        <div className="flex flex-col items-center gap-1.5">
          <p className="m-0 text-xs font-semibold tracking-wider text-[var(--color-blue)] uppercase">
            {APP_INFO.TITLE}
          </p>
          <h1 className="m-0 text-2xl leading-tight font-bold tracking-[-0.025em] text-[var(--color-navy)] sm:text-3xl">
            Leaderboard
          </h1>
          {state ? (
            <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)] tabular-nums">
              {getSessionStatusSummary(state)}
            </p>
          ) : null}
        </div>
      </header>

      {isError && !state ? (
        <ErrorState
          message="Gagal memuat data leaderboard."
          onRetry={() => void refetch()}
        />
      ) : null}

      {!isError && !state ? (
        <section
          aria-live="polite"
          className="admin-panel mx-auto flex w-full max-w-[480px] flex-col items-center gap-3 px-6 py-12 text-center"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff] text-[var(--color-blue)]">
            <Trophy size={22} aria-hidden="true" />
          </span>
          <h2 className="m-0 text-lg font-bold text-[var(--color-navy)]">
            Menunggu sesi kuis dibuka…
          </h2>
          <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
            Papan peringkat akan tampil otomatis begitu sesi kuis dimulai.
          </p>
        </section>
      ) : null}

      {state && state.leaderboard.length === 0 ? (
        <section
          aria-live="polite"
          className="admin-panel mx-auto flex w-full max-w-[480px] flex-col items-center gap-3 px-6 py-12 text-center"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff] text-[var(--color-blue)]">
            <Users size={22} aria-hidden="true" />
          </span>
          <h2 className="m-0 text-lg font-bold text-[var(--color-navy)]">
            Belum ada peserta bergabung
          </h2>
          <p className="m-0 text-sm font-medium text-[var(--color-navy-muted)]">
            Peringkat akan diperbarui otomatis secara realtime.
          </p>
        </section>
      ) : null}

      {state && state.leaderboard.length > 0 ? (
        <>
          <Podium entries={state.leaderboard} />

          <section
            aria-labelledby="live-leaderboard-heading"
            className="admin-panel flex flex-col gap-4 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(23,35,59,0.08)] pb-3">
              <h2
                id="live-leaderboard-heading"
                className="m-0 text-base font-bold tracking-[-0.015em] text-[var(--color-navy)]"
              >
                {state.session.phase === 'finished'
                  ? 'Peringkat Final'
                  : 'Peringkat Sementara'}
              </h2>
              <Badge
                tone={
                  state.session.phase === 'finished' ? 'solid-blue' : 'blue'
                }
              >
                {state.playerCount} peserta
              </Badge>
            </div>

            <LeaderboardList entries={state.leaderboard} />
          </section>
        </>
      ) : null}
    </main>
  );
}
