import { API_ENDPOINTS } from '@/constants/endpoint.constant';
import { requestApi } from '@/lib/axios';
import type { AnswerRequest, JoinRequest } from '@/types/game';
import {
  answerResponseSchema,
  joinResponseSchema,
  playMeSchema,
  playerStateSchema,
} from '@/validations/game.schema';

export const playService = {
  getMe: (signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.PLAY_ME,
        method: 'GET',
        signal,
      },
      playMeSchema,
    ),

  join: (payload: JoinRequest, signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.PLAY_JOIN,
        method: 'POST',
        data: payload,
        signal,
      },
      joinResponseSchema,
    ),

  getState: (signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.PLAY_STATE,
        method: 'GET',
        signal,
      },
      playerStateSchema,
    ),

  submitAnswer: (payload: AnswerRequest, signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.PLAY_ANSWER,
        method: 'POST',
        data: payload,
        signal,
      },
      answerResponseSchema,
    ),
};
