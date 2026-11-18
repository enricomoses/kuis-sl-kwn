'use client';

import { useCallback, useState } from 'react';
import {
  QUERY_KEYS,
  toAdminQueryIdentity,
} from '@/constants/query-keys.constant';
import {
  useAdminGameState,
  useAdminSessionAction,
  useCreateAdminSession,
  useKickPlayer,
} from '@/hooks/queries/use-admin-game';
import { useCountdown } from '@/hooks/use-countdown';
import { useSessionRealtime } from '@/hooks/use-session-realtime';
import { extractAdminMutationError } from '@/lib/errors';
import { notifyError, notifyInfo, notifySuccess } from '@/lib/toast';
import { usePreferences } from '@/providers/preferences-provider';
import type { AdminSessionProfile } from '@/types/auth';
import type {
  AdminGameState,
  AdminSessionAction,
  CreateSessionRequest,
} from '@/types/game';
import { computeOffset } from '@/utils/game-timer';
import { createSessionSchema } from '@/validations/game.schema';

export function useAdminGameConsole(
  profile: AdminSessionProfile,
  initialState: AdminGameState | null,
) {
  const identity = toAdminQueryIdentity(profile);
  const [offsetMs, setOffsetMs] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [completedSnapshot, setCompletedSnapshot] =
    useState<AdminGameState | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [kickCandidate, setKickCandidate] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<
    Record<string, string[]>
  >({});

  const hideLiveScores = usePreferences((s) => s.hideLiveScores);
  const toggleHideLiveScores = usePreferences((s) => s.toggleHideLiveScores);

  const handleClockSample = useCallback((sampleMs: number) => {
    setOffsetMs(sampleMs);
  }, []);

  const gameQuery = useAdminGameState({
    profile,
    initialData: initialState,
    realtimeConnected,
    onClockSample: handleClockSample,
  });

  const activeState = gameQuery.data ?? null;
  const displayState = activeState ?? completedSnapshot;

  const realtime = useSessionRealtime({
    audience: 'admin',
    sessionId: activeState?.session.id ?? null,
    queryKey: QUERY_KEYS.ADMIN_GAME(identity),
    enabled: Boolean(activeState),
    currentVersion: activeState?.version ?? -1,
    onConnectionChange: setRealtimeConnected,
  });

  const countdownTarget =
    activeState?.session.phase === 'countdown'
      ? activeState.currentQuestion?.startsAt
      : activeState?.session.phase === 'question'
        ? activeState.currentQuestion?.endsAt
        : null;

  const isTimerActive =
    activeState?.session.phase === 'countdown' ||
    activeState?.session.phase === 'question';

  const handleExpiredRefetch = useCallback(() => {
    void gameQuery.refetch();
  }, [gameQuery]);

  const countdown = useCountdown({
    targetIso: countdownTarget,
    serverNowIso: activeState?.serverNow,
    offsetMs,
    active: isTimerActive,
    jitterMaxMs: 0,
    onExpiredRefetch: handleExpiredRefetch,
  });

  const createMutation = useCreateAdminSession(profile);
  const actionMutation = useAdminSessionAction(profile);
  const kickMutation = useKickPlayer(profile);

  async function createSession(rawInput: CreateSessionRequest) {
    setCreateError(null);
    setCreateFieldErrors({});
    const parsed = createSessionSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : '_form';
        fields[key] = [...(fields[key] ?? []), issue.message];
      }
      setCreateFieldErrors(fields);
      return;
    }

    try {
      setCompletedSnapshot(null);
      const started = Date.now();
      const response = await createMutation.mutateAsync(parsed.data);
      handleClockSample(
        computeOffset(response.data.serverNow, started, Date.now()),
      );
      notifySuccess(
        'Sesi kuis berhasil dibuka. Pemain sudah dapat bergabung.',
        {
          toastId: 'session-created',
        },
      );
    } catch (err) {
      const parsedErr = extractAdminMutationError(
        err,
        'Gagal membuat sesi baru.',
      );
      setCreateError(parsedErr.message);
      setCreateFieldErrors(parsedErr.fields);
      if (parsedErr.code === 'ACTIVE_SESSION_EXISTS') {
        void gameQuery.refetch();
      }
    }
  }

  async function runAction(action: AdminSessionAction) {
    if (!activeState) return;
    try {
      const started = Date.now();
      const response = await actionMutation.mutateAsync({
        sessionId: activeState.session.id,
        payload: {
          action,
          expectedVersion: activeState.version,
        },
      });
      handleClockSample(
        computeOffset(response.data.serverNow, started, Date.now()),
      );

      if (action === 'finish') {
        setCompletedSnapshot(response.data);
        notifySuccess('Kuis selesai! Papan peringkat final ditampilkan.', {
          toastId: 'session-finished',
        });
      } else if (action === 'cancel') {
        setCompletedSnapshot(null);
        setCancelConfirmOpen(false);
        notifyInfo('Sesi kuis telah dibatalkan.', {
          toastId: 'session-cancelled',
        });
      }
    } catch (err) {
      const parsedErr = extractAdminMutationError(
        err,
        'Gagal memperbarui state sesi.',
      );
      if (parsedErr.isConflict) {
        notifyInfo('State sesi diperbarui ke versi terbaru.', {
          toastId: 'session-conflict',
        });
        void gameQuery.refetch();
        return;
      }
      notifyError(parsedErr.message, { toastId: 'session-action-error' });
    }
  }

  async function confirmKickPlayer() {
    if (!activeState || !kickCandidate) return;
    try {
      await kickMutation.mutateAsync({
        sessionId: activeState.session.id,
        playerId: kickCandidate.id,
      });
      notifyInfo(`${kickCandidate.name} dikeluarkan dari sesi.`, {
        toastId: 'player-kicked',
      });
      setKickCandidate(null);
    } catch (err) {
      const parsedErr = extractAdminMutationError(
        err,
        'Gagal mengeluarkan pemain.',
      );
      notifyError(parsedErr.message);
    }
  }

  function startFreshSessionScreen() {
    setCompletedSnapshot(null);
    void gameQuery.refetch();
  }

  return {
    state: displayState,
    isActiveSession: Boolean(activeState),
    isLoading: gameQuery.isLoading,
    isError: gameQuery.isError,
    refetch: gameQuery.refetch,
    remainingMs: countdown.remainingMs,
    remainingSeconds: countdown.remainingSeconds,
    connectionStatus: realtime.status,
    hideLiveScores,
    toggleHideLiveScores,
    createError,
    createFieldErrors,
    isCreating: createMutation.isPending,
    isActionPending: actionMutation.isPending,
    isKicking: kickMutation.isPending,
    cancelConfirmOpen,
    setCancelConfirmOpen,
    kickCandidate,
    setKickCandidate,
    createSession,
    runAction,
    confirmKickPlayer,
    startFreshSessionScreen,
  };
}
