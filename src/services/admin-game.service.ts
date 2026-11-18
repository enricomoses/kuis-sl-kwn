import { API_ENDPOINTS } from '@/constants/endpoint.constant';
import { requestApi } from '@/lib/axios';
import type {
  AdminSessionActionRequest,
  CreateSessionRequest,
} from '@/types/game';
import {
  adminGameStateNullableSchema,
  adminGameStateSchema,
  kickPlayerResponseSchema,
  sessionHistoryResponseSchema,
  sessionResultsResponseSchema,
} from '@/validations/game.schema';

export const adminGameService = {
  getActive: (signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_GAME,
        method: 'GET',
        signal,
      },
      adminGameStateNullableSchema,
    ),

  createSession: (payload: CreateSessionRequest, signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_GAME,
        method: 'POST',
        data: payload,
        signal,
      },
      adminGameStateSchema,
    ),

  performAction: (
    sessionId: string,
    payload: AdminSessionActionRequest,
    signal?: AbortSignal,
  ) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_GAME_ACTIONS(sessionId),
        method: 'POST',
        data: payload,
        signal,
      },
      adminGameStateSchema,
    ),

  kickPlayer: (sessionId: string, playerId: string, signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_GAME_KICK_PLAYER(sessionId, playerId),
        method: 'DELETE',
        signal,
      },
      kickPlayerResponseSchema,
    ),

  getHistory: (signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_GAME_HISTORY,
        method: 'GET',
        signal,
      },
      sessionHistoryResponseSchema,
    ),

  getResults: (sessionId: string, signal?: AbortSignal) =>
    requestApi(
      {
        url: API_ENDPOINTS.ADMIN_GAME_RESULTS(sessionId),
        method: 'GET',
        signal,
      },
      sessionResultsResponseSchema,
    ),
};
