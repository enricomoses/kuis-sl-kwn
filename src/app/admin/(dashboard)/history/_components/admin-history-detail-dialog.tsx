'use client';

import { Download } from 'lucide-react';
import { ErrorState } from '@/components/common/feedback/error-state';
import { AdminHistoryDetailSkeleton } from '@/components/common/feedback/page-skeletons';
import { LeaderboardList } from '@/components/common/game/leaderboard-list';
import { buttonStyles } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import type { SessionResultsResponse } from '@/types/game';

interface AdminHistoryDetailDialogProps {
  open: boolean;
  results: SessionResultsResponse | null;
  exportUrl: string | null;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  className?: string;
}

export function AdminHistoryDetailDialog({
  open,
  results,
  exportUrl,
  isLoading,
  isError,
  onClose,
  className,
}: AdminHistoryDetailDialogProps) {
  return (
    <Dialog
      open={open}
      title="Detail Hasil Sesi"
      description="Papan peringkat final beserta statistik akurasi per soal."
      onClose={onClose}
      className={className}
    >
      {isLoading ? <AdminHistoryDetailSkeleton /> : null}

      {isError ? (
        <ErrorState message="Gagal memuat detail hasil sesi." />
      ) : null}

      {results ? (
        <div className="flex flex-col gap-5">
          {exportUrl ? (
            <div className="flex justify-end">
              <a href={exportUrl} className={buttonStyles('secondary', 'sm')}>
                <Download size={16} aria-hidden="true" />
                <span>Unduh CSV</span>
              </a>
            </div>
          ) : null}

          <section className="flex flex-col gap-2">
            <h3 className="quiz-kicker quiz-kicker--blue m-0">
              Peringkat Peserta ({results.leaderboard.length})
            </h3>
            <LeaderboardList entries={results.leaderboard} />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="quiz-kicker quiz-kicker--blue m-0">
              Statistik Per Soal
            </h3>
            <div className="flex flex-col gap-2">
              {results.questionStats.map((stat) => (
                <div
                  key={stat.questionIndex}
                  className="flex flex-col gap-1 rounded-xl bg-[var(--color-white)] p-3.5"
                >
                  <p className="m-0 text-sm font-bold text-[var(--color-navy)]">
                    #{stat.questionIndex + 1} · {stat.prompt}
                  </p>
                  <p className="m-0 text-xs font-semibold text-[var(--color-navy-muted)]">
                    Benar: {stat.correctCount} / {stat.totalAnswered} (
                    {stat.accuracyPercent}%)
                    {stat.avgResponseMs !== null
                      ? ` · Rata-rata waktu jawab: ${(stat.avgResponseMs / 1000).toFixed(1)} dtk`
                      : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </Dialog>
  );
}
