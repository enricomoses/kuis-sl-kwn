'use client';

import { Lock, Plus, RefreshCw } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/feedback/confirm-dialog';
import { EmptyState } from '@/components/common/feedback/empty-state';
import { ErrorState } from '@/components/common/feedback/error-state';
import { PageHeader } from '@/components/common/layout/page-header';
import { Button } from '@/components/ui/button';
import { FeedbackBanner } from '@/components/ui/feedback';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminQuestionsManager } from '@/hooks/use-admin-questions-manager';
import type { AdminSessionProfile } from '@/types/auth';
import type { AdminQuestionListResponse } from '@/types/question';
import { cn } from '@/utils';
import { AdminQuestionCard } from './admin-question-card';
import { AdminQuestionEditorDialog } from './admin-question-editor-dialog';

interface AdminQuestionsViewProps {
  profile: AdminSessionProfile;
  initialData?: AdminQuestionListResponse;
  className?: string;
}

export function AdminQuestionsView({
  profile,
  initialData,
  className,
}: AdminQuestionsViewProps) {
  const manager = useAdminQuestionsManager(profile, initialData);

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <PageHeader
        kicker="MANAJEMEN KONTEN"
        title="Bank Soal"
        subtitle={`${manager.items.length} soal aktif yang akan dipakai pada sesi berikutnya.`}
        aside={
          <Button disabled={manager.locked} onClick={manager.openCreateDialog}>
            <Plus size={18} aria-hidden="true" />
            <span>Tambah Soal</span>
          </Button>
        }
      />

      {manager.locked ? (
        <FeedbackBanner tone="info">
          <span className="inline-flex items-center gap-1.5 font-bold">
            <Lock size={16} aria-hidden="true" />
            <span>Bank soal terkunci sementara.</span>
          </span>{' '}
          Selesaikan atau batalkan sesi aktif di Ruang Kontrol untuk menambah,
          mengubah, mengurutkan, atau mengarsipkan soal.
        </FeedbackBanner>
      ) : null}

      {manager.conflictBanner ? (
        <FeedbackBanner
          tone="error"
          action={
            <Button
              variant="danger"
              size="sm"
              onClick={manager.reloadAfterConflict}
            >
              <RefreshCw size={15} aria-hidden="true" />
              <span>Muat Ulang</span>
            </Button>
          }
        >
          {manager.conflictBanner}
        </FeedbackBanner>
      ) : null}

      {manager.isLoading && manager.items.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : null}

      {manager.isError ? (
        <ErrorState
          message="Gagal memuat daftar soal."
          onRetry={() => void manager.refetch()}
        />
      ) : null}

      {!manager.isLoading && !manager.isError && manager.items.length === 0 ? (
        <EmptyState
          title="Belum ada soal aktif"
          description="Tambahkan minimal satu soal agar Anda dapat membuka sesi kuis."
          action={
            <Button
              disabled={manager.locked}
              onClick={manager.openCreateDialog}
            >
              <Plus size={18} aria-hidden="true" />
              <span>Tambah Soal Pertama</span>
            </Button>
          }
        />
      ) : null}

      <div className="flex flex-col gap-4">
        {manager.items.map((question, index) => (
          <AdminQuestionCard
            key={question.id}
            question={question}
            index={index}
            total={manager.items.length}
            locked={manager.locked}
            reordering={manager.isReordering}
            onMoveUp={() => void manager.moveQuestion(index, 'up')}
            onMoveDown={() => void manager.moveQuestion(index, 'down')}
            onEdit={() => manager.openEditDialog(question)}
            onArchive={() => manager.setArchiveTarget(question)}
          />
        ))}
      </div>

      {manager.editorOpen ? (
        <AdminQuestionEditorDialog
          key={manager.editingQuestion?.id ?? 'new-question'}
          open={manager.editorOpen}
          question={manager.editingQuestion}
          formError={manager.formError}
          fieldErrors={manager.fieldErrors}
          isSaving={manager.isSaving}
          onClose={manager.closeEditorDialog}
          onSave={(candidate) => void manager.saveQuestion(candidate)}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(manager.archiveTarget)}
        title="Arsipkan soal ini?"
        description="Soal yang diarsipkan tidak akan muncul pada sesi kuis baru, namun data riwayat sesi lama tetap tersimpan aman."
        confirmLabel="Arsipkan Soal"
        destructive
        loading={manager.isArchiving}
        onConfirm={() => void manager.confirmArchive()}
        onCancel={() => manager.setArchiveTarget(null)}
      />
    </div>
  );
}
