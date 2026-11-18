'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  QUERY_KEYS,
  toAdminQueryIdentity,
} from '@/constants/query-keys.constant';
import { REALTIME_LIMITS } from '@/constants/realtime.constant';
import {
  ADMIN_QUERY_DEFAULTS,
  invalidateQueryKeys,
  unwrapData,
} from '@/hooks/queries/query-helpers';
import { adminGameService } from '@/services/admin-game.service';
import type { AdminSessionProfile } from '@/types/auth';
import type {
  AdminGameState,
  AdminSessionActionRequest,
  CreateSessionRequest,
  SessionHistoryResponse,
} from '@/types/game';
import { computeOffset } from '@/utils/game-timer';

export function useAdminGameState(options: {
  profile: AdminSessionProfile;
  initialData?: AdminGameState | null;
  realtimeConnected: boolean;
  onClockSample?: (offsetMs: number) => void;
}) {
  const identity = toAdminQueryIdentity(options.profile);

  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_GAME(identity),
    queryFn: async ({ signal }) => {
      const started = Date.now();
      const data = await unwrapData(adminGameService.getActive(signal));
      const received = Date.now();
      if (data?.serverNow && options.onClockSample) {
        options.onClockSample(computeOffset(data.serverNow, started, received));
      }
      return data;
    },
    initialData: options.initialData,
    refetchInterval: (query) => {
      if (!query.state.data) return false;
      return options.realtimeConnected
        ? false
        : REALTIME_LIMITS.FALLBACK_POLL_MS;
    },
    ...ADMIN_QUERY_DEFAULTS,
  });
}

export function useCreateAdminSession(profile: AdminSessionProfile) {
  const queryClient = useQueryClient();
  const identity = toAdminQueryIdentity(profile);
  const gameKey = QUERY_KEYS.ADMIN_GAME(identity);
  const questionsKey = QUERY_KEYS.ADMIN_QUESTIONS(identity);

  return useMutation({
    mutationFn: (payload: CreateSessionRequest) =>
      adminGameService.createSession(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(gameKey, response.data);
      void invalidateQueryKeys(queryClient, [questionsKey]);
    },
  });
}

export function useAdminSessionAction(profile: AdminSessionProfile) {
  const queryClient = useQueryClient();
  const identity = toAdminQueryIdentity(profile);
  const gameKey = QUERY_KEYS.ADMIN_GAME(identity);
  const questionsKey = QUERY_KEYS.ADMIN_QUESTIONS(identity);
  const historyKey = QUERY_KEYS.ADMIN_HISTORY(identity);

  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: AdminSessionActionRequest;
    }) => adminGameService.performAction(sessionId, payload),
    onSuccess: (response, variables) => {
      if (
        variables.payload.action === 'finish' ||
        variables.payload.action === 'cancel'
      ) {
        queryClient.setQueryData(gameKey, null);
        void invalidateQueryKeys(queryClient, [questionsKey, historyKey]);
      } else {
        queryClient.setQueryData(gameKey, response.data);
      }
    },
  });
}

export function useKickPlayer(profile: AdminSessionProfile) {
  const queryClient = useQueryClient();
  const identity = toAdminQueryIdentity(profile);
  const gameKey = QUERY_KEYS.ADMIN_GAME(identity);

  return useMutation({
    mutationFn: ({
      sessionId,
      playerId,
    }: {
      sessionId: string;
      playerId: string;
    }) => adminGameService.kickPlayer(sessionId, playerId),
    onSuccess: () => invalidateQueryKeys(queryClient, [gameKey]),
  });
}

export function useAdminHistory(
  profile: AdminSessionProfile,
  initialData?: SessionHistoryResponse,
) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_HISTORY(toAdminQueryIdentity(profile)),
    queryFn: ({ signal }) => unwrapData(adminGameService.getHistory(signal)),
    initialData,
    ...ADMIN_QUERY_DEFAULTS,
  });
}

export function useAdminSessionResults(
  profile: AdminSessionProfile,
  sessionId: string | null,
) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_RESULTS(
      toAdminQueryIdentity(profile),
      sessionId ?? 'none',
    ),
    queryFn: ({ signal }) =>
      unwrapData(adminGameService.getResults(sessionId ?? '', signal)),
    enabled: Boolean(sessionId),
    ...ADMIN_QUERY_DEFAULTS,
  });
}
