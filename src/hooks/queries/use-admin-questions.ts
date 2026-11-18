'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  QUERY_KEYS,
  toAdminQueryIdentity,
} from '@/constants/query-keys.constant';
import {
  ADMIN_QUERY_DEFAULTS,
  invalidateQueryKeys,
  unwrapData,
} from '@/hooks/queries/query-helpers';
import { adminQuestionService } from '@/services/admin-question.service';
import type { AdminSessionProfile } from '@/types/auth';
import type {
  AdminQuestionListResponse,
  QuestionFormInput,
  ReorderQuestionsInput,
  UpdateQuestionInput,
} from '@/types/question';

export function useAdminQuestions(
  profile: AdminSessionProfile,
  initialData?: AdminQuestionListResponse,
) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_QUESTIONS(toAdminQueryIdentity(profile)),
    queryFn: ({ signal }) => unwrapData(adminQuestionService.list(signal)),
    initialData,
    ...ADMIN_QUERY_DEFAULTS,
  });
}

export function useCreateAdminQuestion(profile: AdminSessionProfile) {
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.ADMIN_QUESTIONS(toAdminQueryIdentity(profile));

  return useMutation({
    mutationFn: (payload: QuestionFormInput) =>
      adminQuestionService.create(payload),
    onSuccess: () => invalidateQueryKeys(queryClient, [key]),
  });
}

export function useUpdateAdminQuestion(profile: AdminSessionProfile) {
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.ADMIN_QUESTIONS(toAdminQueryIdentity(profile));

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateQuestionInput;
    }) => adminQuestionService.update(id, payload),
    onSuccess: () => invalidateQueryKeys(queryClient, [key]),
  });
}

export function useArchiveAdminQuestion(profile: AdminSessionProfile) {
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.ADMIN_QUESTIONS(toAdminQueryIdentity(profile));

  return useMutation({
    mutationFn: (id: string) => adminQuestionService.archive(id),
    onSuccess: () => invalidateQueryKeys(queryClient, [key]),
  });
}

export function useReorderAdminQuestions(profile: AdminSessionProfile) {
  const queryClient = useQueryClient();
  const key = QUERY_KEYS.ADMIN_QUESTIONS(toAdminQueryIdentity(profile));

  return useMutation({
    mutationFn: (payload: ReorderQuestionsInput) =>
      adminQuestionService.reorder(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(key, response.data);
    },
  });
}
