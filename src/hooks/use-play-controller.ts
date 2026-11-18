'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { QUERY_KEYS } from '@/constants/query-keys.constant';
import { REALTIME_LIMITS } from '@/constants/realtime.constant';
import { ROUTES } from '@/constants/routes.constant';
import { usePlayerState, useSubmitAnswer } from '@/hooks/queries/use-play';
import { useCountdown } from '@/hooks/use-countdown';
import { useSessionRealtime } from '@/hooks/use-session-realtime';
import { ApiClientError } from '@/lib/errors';
import { notifyError, notifyInfo } from '@/lib/toast';
import type { AnswerRequest, PlayerState } from '@/types/game';

function derivePhaseKey(state: PlayerState | undefined): string {
  if (!state) return '';
  if (
    state.phase === 'countdown' ||
    state.phase === 'question' ||
    state.phase === 'reveal'
  ) {
    return `${state.phase}:${state.questionIndex}`;
  }
  return state.phase;
}

function derivePhaseAnnouncement(state: PlayerState | undefined): string {
  if (!state) return '';
  if (state.phase === 'countdown') {
    return `Bersiap untuk soal ${state.questionIndex + 1}.`;
  }
  if (state.phase === 'question') {
    return `Soal ${state.questionIndex + 1} dimulai: ${state.question.prompt}`;
  }
  if (state.phase === 'reveal') {
    return state.myResult.isCorrect
      ? `Waktu habis. Jawabanmu benar, kamu mendapat ${state.myResult.points} poin.`
      : 'Waktu habis. Lihat jawaban yang benar.';
  }
  if (state.phase === 'finished') {
    return 'Kuis selesai. Papan peringkat final ditampilkan.';
  }
  if (state.phase === 'cancelled') {
    return 'Sesi kuis telah dibatalkan oleh admin.';
  }
  return '';
}

export function usePlayController(initialState?: PlayerState) {
  const router = useRouter();
  const [offsetMs, setOffsetMs] = useState(0);
  const [timerNotice, setTimerNotice] = useState<{
    phaseKey: string;
    message: string;
  } | null>(null);
  const [failedSubmission, setFailedSubmission] =
    useState<AnswerRequest | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const handleClockSample = useCallback((sampleMs: number) => {
    setOffsetMs(sampleMs);
  }, []);

  const stateQuery = usePlayerState({
    initialData: initialState,
    realtimeConnected,
    onClockSample: handleClockSample,
  });

  const state = stateQuery.data;
  const sessionId = state?.session.id ?? null;
  const phaseKey = derivePhaseKey(state);
  const isTerminalPhase =
    state?.phase === 'finished' || state?.phase === 'cancelled';

  const realtime = useSessionRealtime({
    audience: 'players',
    sessionId,
    queryKey: QUERY_KEYS.PLAY_STATE,
    enabled: Boolean(sessionId) && !isTerminalPhase,
    currentVersion: state?.version ?? -1,
    onConnectionChange: setRealtimeConnected,
  });

  // Redirect back to home if player cookie is invalid / kicked
  useEffect(() => {
    if (
      stateQuery.error instanceof ApiClientError &&
      stateQuery.error.code === 'NOT_JOINED'
    ) {
      router.replace(ROUTES.HOME);
    }
  }, [router, stateQuery.error]);

  const countdownTarget =
    state?.phase === 'countdown'
      ? state.startsAt
      : state?.phase === 'question'
        ? state.endsAt
        : null;

  const isTimerActive =
    state?.phase === 'countdown' || state?.phase === 'question';

  const handleExpiredRefetch = useCallback(() => {
    void stateQuery.refetch();
  }, [stateQuery]);

  const handleThresholdAnnounce = useCallback(
    (seconds: number) => {
      setTimerNotice({
        phaseKey,
        message: `Sisa waktu ${seconds} detik.`,
      });
    },
    [phaseKey],
  );

  const countdown = useCountdown({
    targetIso: countdownTarget,
    serverNowIso: state?.serverNow,
    offsetMs,
    active: isTimerActive,
    jitterMaxMs: REALTIME_LIMITS.PLAYER_JITTER_MAX_MS,
    onExpiredRefetch: handleExpiredRefetch,
    onThresholdAnnounce:
      state?.phase === 'question' ? handleThresholdAnnounce : undefined,
  });

  const submitMutation = useSubmitAnswer();

  const submitAnswer = useCallback(
    async (payload: AnswerRequest) => {
      setFailedSubmission(null);
      try {
        await submitMutation.mutateAsync(payload);
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.code === 'ANSWER_CLOSED') {
            notifyInfo(err.message, { toastId: 'answer-closed' });
            void stateQuery.refetch();
            return;
          }
          if (
            err.code === 'STALE_QUESTION' ||
            err.code === 'ANSWER_TOO_EARLY'
          ) {
            notifyInfo(err.message, { toastId: 'answer-sync' });
            void stateQuery.refetch();
            return;
          }
          if (err.code === 'NOT_JOINED') {
            router.replace(ROUTES.HOME);
            return;
          }
          setFailedSubmission(payload);
          notifyError(err.message, { toastId: 'answer-error' });
          return;
        }
        setFailedSubmission(payload);
        notifyError('Jawaban gagal terkirim. Kamu dapat mencoba kirim ulang.', {
          toastId: 'answer-error',
        });
      }
    },
    [router, stateQuery, submitMutation],
  );

  const selectOption = useCallback(
    (optionId: string) => {
      if (!state || state.phase !== 'question') return;
      if (state.myAnswer || submitMutation.isPending) return;
      void submitAnswer({
        questionIndex: state.questionIndex,
        optionId,
      });
    },
    [state, submitAnswer, submitMutation.isPending],
  );

  const activeFailedSubmission =
    state?.phase === 'question' &&
    failedSubmission?.questionIndex === state.questionIndex
      ? failedSubmission
      : null;

  const retrySubmit = useCallback(() => {
    if (!activeFailedSubmission) return;
    void submitAnswer(activeFailedSubmission);
  }, [activeFailedSubmission, submitAnswer]);

  const announcement =
    timerNotice && timerNotice.phaseKey === phaseKey
      ? timerNotice.message
      : derivePhaseAnnouncement(state);

  return {
    state,
    isLoading: stateQuery.isLoading,
    isError: stateQuery.isError,
    error: stateQuery.error,
    refetch: stateQuery.refetch,
    remainingMs: countdown.remainingMs,
    remainingSeconds: countdown.remainingSeconds,
    connectionStatus: realtime.status,
    isSubmitting: submitMutation.isPending,
    failedSubmission: activeFailedSubmission,
    announcement,
    selectOption,
    retrySubmit,
  };
}
