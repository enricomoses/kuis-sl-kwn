'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, STALE_TIME } from '@/constants/query-keys.constant';
import { REALTIME_LIMITS } from '@/constants/realtime.constant';
import { unwrapData } from '@/hooks/queries/query-helpers';
import { playService } from '@/services/play.service';
import type {
  AnswerRequest,
  JoinRequest,
  PlayMeResponse,
  PlayerState,
} from '@/types/game';
import { computeOffset } from '@/utils/game-timer';

export function usePlayMe(options: {
  initialData?: PlayMeResponse;
  realtimeConnected: boolean;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.PLAY_ME,
    queryFn: ({ signal }) => unwrapData(playService.getMe(signal)),
    initialData: options.initialData,
    staleTime: STALE_TIME.LIVE,
    refetchInterval: options.realtimeConnected
      ? false
      : REALTIME_LIMITS.FALLBACK_POLL_MS,
  });
}

export function useJoinSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JoinRequest) => playService.join(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAY_ME });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAY_STATE });
    },
  });
}

export function usePlayerState(options: {
  initialData?: PlayerState;
  realtimeConnected: boolean;
  onClockSample?: (offsetMs: number) => void;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.PLAY_STATE,
    queryFn: async ({ signal }) => {
      const started = Date.now();
      const data = await unwrapData(playService.getState(signal));
      const received = Date.now();
      if (options.onClockSample) {
        options.onClockSample(computeOffset(data.serverNow, started, received));
      }
      return data;
    },
    initialData: options.initialData,
    staleTime: STALE_TIME.LIVE,
    refetchInterval: (query) => {
      const phase = query.state.data?.phase;
      if (phase === 'finished' || phase === 'cancelled') return false;
      if (!options.realtimeConnected) return REALTIME_LIMITS.FALLBACK_POLL_MS;
      if (phase === 'lobby') return REALTIME_LIMITS.LOBBY_POLL_MS;
      return false;
    },
  });
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AnswerRequest) => playService.submitAnswer(payload),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PLAY_STATE });
      const previous = queryClient.getQueryData<PlayerState>(
        QUERY_KEYS.PLAY_STATE,
      );

      if (
        previous &&
        (previous.phase === 'question' || previous.phase === 'countdown') &&
        previous.questionIndex === variables.questionIndex
      ) {
        const optimisticState: PlayerState = {
          ...previous,
          myAnswer: { optionId: variables.optionId },
        };
        queryClient.setQueryData<PlayerState>(
          QUERY_KEYS.PLAY_STATE,
          optimisticState,
        );
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.PLAY_STATE, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAY_STATE });
    },
  });
}
