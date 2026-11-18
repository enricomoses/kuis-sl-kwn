'use client';

import { useState } from 'react';
import {
  useAdminQuestions,
  useArchiveAdminQuestion,
  useCreateAdminQuestion,
  useReorderAdminQuestions,
  useUpdateAdminQuestion,
} from '@/hooks/queries/use-admin-questions';
import { extractAdminMutationError } from '@/lib/errors';
import { notifyError, notifySuccess } from '@/lib/toast';
import type { AdminSessionProfile } from '@/types/auth';
import type {
  AdminQuestion,
  AdminQuestionListResponse,
  QuestionFormInput,
} from '@/types/question';
import { questionFormSchema } from '@/validations/question.schema';

export function useAdminQuestionsManager(
  profile: AdminSessionProfile,
  initialData?: AdminQuestionListResponse,
) {
  const questionsQuery = useAdminQuestions(profile, initialData);
  const createMutation = useCreateAdminQuestion(profile);
  const updateMutation = useUpdateAdminQuestion(profile);
  const archiveMutation = useArchiveAdminQuestion(profile);
  const reorderMutation = useReorderAdminQuestions(profile);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(
    null,
  );
  const [archiveTarget, setArchiveTarget] = useState<AdminQuestion | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [conflictBanner, setConflictBanner] = useState<string | null>(null);

  const items = questionsQuery.data?.items ?? [];
  const locked = questionsQuery.data?.locked ?? false;

  function openCreateDialog() {
    setEditingQuestion(null);
    setFormError(null);
    setFieldErrors({});
    setConflictBanner(null);
    setEditorOpen(true);
  }

  function openEditDialog(question: AdminQuestion) {
    setEditingQuestion(question);
    setFormError(null);
    setFieldErrors({});
    setConflictBanner(null);
    setEditorOpen(true);
  }

  function closeEditorDialog() {
    setEditorOpen(false);
    setEditingQuestion(null);
    setFormError(null);
    setFieldErrors({});
  }

  async function saveQuestion(candidate: QuestionFormInput) {
    setFormError(null);
    setFieldErrors({});
    const parsed = questionFormSchema.safeParse(candidate);
    if (!parsed.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.length > 0 ? issue.path.join('.') : '_form';
        fields[key] = [...(fields[key] ?? []), issue.message];
      }
      setFieldErrors(fields);
      setFormError('Periksa kembali isian soal sebelum menyimpan.');
      return;
    }

    try {
      if (editingQuestion) {
        await updateMutation.mutateAsync({
          id: editingQuestion.id,
          payload: {
            ...parsed.data,
            expectedUpdatedAt: editingQuestion.updatedAt,
          },
        });
        notifySuccess('Soal berhasil diperbarui.');
      } else {
        await createMutation.mutateAsync(parsed.data);
        notifySuccess('Soal baru berhasil ditambahkan.');
      }
      closeEditorDialog();
    } catch (err) {
      const parsedErr = extractAdminMutationError(
        err,
        'Gagal menyimpan soal. Silakan coba lagi.',
      );
      if (parsedErr.code === 'CONFLICT') {
        setConflictBanner(parsedErr.message);
      }
      if (parsedErr.code === 'QUESTION_BANK_LOCKED') {
        void questionsQuery.refetch();
      }
      setFormError(parsedErr.message);
      setFieldErrors(parsedErr.fields);
      notifyError(parsedErr.message);
    }
  }

  async function confirmArchive() {
    if (!archiveTarget) return;
    try {
      await archiveMutation.mutateAsync(archiveTarget.id);
      notifySuccess('Soal berhasil diarsipkan.');
      setArchiveTarget(null);
    } catch (err) {
      const parsedErr = extractAdminMutationError(
        err,
        'Gagal mengarsipkan soal.',
      );
      if (parsedErr.code === 'CONFLICT') {
        setConflictBanner(parsedErr.message);
      }
      notifyError(parsedErr.message);
    }
  }

  async function moveQuestion(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const nextOrder = [...items];
    const [moved] = nextOrder.splice(index, 1);
    nextOrder.splice(targetIndex, 0, moved);

    try {
      await reorderMutation.mutateAsync({
        orderedIds: nextOrder.map((q) => q.id),
      });
      notifySuccess('Urutan soal diperbarui.', { toastId: 'question-reorder' });
    } catch (err) {
      const parsedErr = extractAdminMutationError(
        err,
        'Gagal mengubah urutan soal.',
      );
      if (parsedErr.code === 'CONFLICT') {
        setConflictBanner(parsedErr.message);
        void questionsQuery.refetch();
      }
      notifyError(parsedErr.message);
    }
  }

  function reloadAfterConflict() {
    setConflictBanner(null);
    closeEditorDialog();
    void questionsQuery.refetch();
  }

  return {
    items,
    locked,
    isLoading: questionsQuery.isLoading,
    isError: questionsQuery.isError,
    refetch: questionsQuery.refetch,
    editorOpen,
    editingQuestion,
    archiveTarget,
    setArchiveTarget,
    formError,
    fieldErrors,
    conflictBanner,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isReordering: reorderMutation.isPending,
    openCreateDialog,
    openEditDialog,
    closeEditorDialog,
    saveQuestion,
    confirmArchive,
    moveQuestion,
    reloadAfterConflict,
  };
}
