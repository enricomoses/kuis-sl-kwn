import { API_ENDPOINTS } from '@/constants/endpoint.constant';
import { requestApi } from '@/lib/axios';
import type {
  QuestionFormInput,
  ReorderQuestionsInput,
  UpdateQuestionInput,
} from '@/types/question';
import {
  adminQuestionListResponseSchema,
  adminQuestionSchema,
  archiveQuestionResponseSchema,
} from '@/validations/question.schema';

export const adminQuestionService = {
  list: (signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_QUESTIONS,
        method: 'GET',
        signal,
      },
      adminQuestionListResponseSchema,
    ),

  create: (payload: QuestionFormInput, signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_QUESTIONS,
        method: 'POST',
        data: payload,
        signal,
      },
      adminQuestionSchema,
    ),

  update: (id: string, payload: UpdateQuestionInput, signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_QUESTION_DETAIL(id),
        method: 'PATCH',
        data: payload,
        signal,
      },
      adminQuestionSchema,
    ),

  archive: (id: string, signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_QUESTION_DETAIL(id),
        method: 'DELETE',
        signal,
      },
      archiveQuestionResponseSchema,
    ),

  reorder: (payload: ReorderQuestionsInput, signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_QUESTIONS_REORDER,
        method: 'POST',
        data: payload,
        signal,
      },
      adminQuestionListResponseSchema,
    ),
};
