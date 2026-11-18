'use client';

import { BarChart3, Download, Trophy, Users } from 'lucide-react';
import { EmptyState } from '@/components/common/feedback/empty-state';
import { ErrorState } from '@/components/common/feedback/error-state';
import { PageHeader } from '@/components/common/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button, buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminHistoryManager } from '@/hooks/use-admin-history';
import type { AdminSessionProfile } from '@/types/auth';
import type { SessionHistoryResponse } from '@/types/game';
import { cn } from '@/utils';
import { AdminHistoryDetailDialog } from './admin-history-detail-dialog';

interface AdminHistoryViewProps {
  profile: AdminSessionProfile;
  initialData?: SessionHistoryResponse;
  className?: string;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function AdminHistoryView({
  profile,
  initialData,
  className,
}: AdminHistoryViewProps) {
  const manager = useAdminHistoryManager(profile, initialData);

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <PageHeader
        kicker="ARSIP & EKSPOR"
        title="Riwayat Sesi"
        subtitle="Lihat peringkat final, akurasi tiap soal, dan unduh hasil sesi dalam format CSV."
      />

      {manager.isLoading && manager.items.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : null}

      {manager.isError ? (
        <ErrorState
          message="Gagal memuat riwayat sesi."
          onRetry={() => void manager.refetch()}
        />
      ) : null}

      {!manager.isLoading && !manager.isError && manager.items.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat sesi"
          description="Sesi yang telah selesai atau dibatalkan akan muncul otomatis di sini."
        />
      ) : null}

      <div className="flex flex-col gap-3">
        {manager.items.map((session) => (
          <Card
            key={session.id}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={session.status === 'finished' ? 'blue' : 'coral'}>
                  {session.status === 'finished' ? 'Selesai' : 'Dibatalkan'}
                </Badge>
                <span className="text-sm font-bold text-[var(--color-navy)]">
                  {formatDateTime(session.createdAt)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[var(--color-navy-muted)]">
                <span className="inline-flex items-center gap-1">
                  <Users size={15} aria-hidden="true" />
                  <span>{session.playerCount} pemain</span>
                </span>
                <span>{session.totalQuestions} soal</span>
                {session.topPlayerName ? (
                  <span className="inline-flex items-center gap-1 text-[var(--color-navy)]">
                    <Trophy
                      size={15}
                      className="text-[var(--color-blue)]"
                      aria-hidden="true"
                    />
                    <span>
                      Juara: <strong>{session.topPlayerName}</strong> (
                      {(session.topPlayerScore ?? 0).toLocaleString('id-ID')})
                    </span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => manager.openResults(session.id)}
              >
                <BarChart3 size={16} aria-hidden="true" />
                <span>Lihat Detail</span>
              </Button>
              <a
                href={manager.getExportUrl(session.id)}
                className={buttonStyles('ghost', 'sm')}
              >
                <Download size={16} aria-hidden="true" />
                <span>CSV</span>
              </a>
            </div>
          </Card>
        ))}
      </div>

      <AdminHistoryDetailDialog
        open={Boolean(manager.selectedSessionId)}
        results={manager.results}
        exportUrl={
          manager.selectedSessionId
            ? manager.getExportUrl(manager.selectedSessionId)
            : null
        }
        isLoading={manager.isResultsLoading}
        isError={manager.isResultsError}
        onClose={manager.closeResults}
      />
    </div>
  );
}
