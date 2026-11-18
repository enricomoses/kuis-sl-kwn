'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { REALTIME_LIMITS } from '@/constants/realtime.constant';
import { subscribeLobbyChannel } from '@/realtime/lobby.channel';
import { subscribeSessionAdminChannel } from '@/realtime/session-admin.channel';
import { subscribeSessionPlayersChannel } from '@/realtime/session-players.channel';
import type { RealtimeConnectionStatus, RealtimeHint } from '@/types/game';

type RealtimeAudience = 'lobby' | 'players' | 'admin';

export interface SubscribeAdapterParams {
  audience: RealtimeAudience;
  sessionId: string | null;
  onHint: (hint: RealtimeHint) => void;
  onStatusChange: (status: RealtimeConnectionStatus) => void;
}

export interface UseSessionRealtimeOptions {
  audience: RealtimeAudience;
  sessionId?: string | null;
  queryKey: readonly unknown[];
  enabled?: boolean;
  currentVersion?: number;
  onConnectionChange?: (connected: boolean) => void;
  subscribeAdapter?: (params: SubscribeAdapterParams) => () => void;
}

function defaultSubscribeAdapter({
  audience,
  sessionId,
  onHint,
  onStatusChange,
}: SubscribeAdapterParams): () => void {
  if (audience === 'lobby') {
    return subscribeLobbyChannel({ onHint, onStatusChange });
  }
  if (!sessionId) {
    onStatusChange('DISCONNECTED');
    return () => {};
  }
  if (audience === 'players') {
    return subscribeSessionPlayersChannel({
      sessionId,
      onHint,
      onStatusChange,
    });
  }
  return subscribeSessionAdminChannel({
    sessionId,
    onHint,
    onStatusChange,
  });
}

export function useSessionRealtime({
  audience,
  sessionId = null,
  queryKey,
  enabled = true,
  currentVersion = -1,
  onConnectionChange,
  subscribeAdapter = defaultSubscribeAdapter,
}: UseSessionRealtimeOptions): {
  status: RealtimeConnectionStatus;
  isConnected: boolean;
} {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeConnectionStatus>(
    enabled ? 'CONNECTING' : 'DISCONNECTED',
  );

  const queryKeyRef = useRef(queryKey);
  const onConnectionChangeRef = useRef(onConnectionChange);
  const lastVersionRef = useRef<number>(currentVersion);
  const wasSubscribedRef = useRef(false);
  const hadDisconnectionRef = useRef(false);

  useEffect(() => {
    queryKeyRef.current = queryKey;
  }, [queryKey]);

  useEffect(() => {
    onConnectionChangeRef.current = onConnectionChange;
  }, [onConnectionChange]);

  useEffect(() => {
    if (currentVersion > lastVersionRef.current) {
      lastVersionRef.current = currentVersion;
    }
  }, [currentVersion]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (audience !== 'lobby' && !sessionId) {
      return;
    }

    lastVersionRef.current = currentVersion;
    wasSubscribedRef.current = false;
    hadDisconnectionRef.current = false;

    let jitterTimer: ReturnType<typeof setTimeout> | null = null;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    let lastAdminEmitAt = 0;
    let pendingTrailingAdmin = false;

    const triggerInvalidate = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeyRef.current });
    };

    const scheduleAdminThrottledInvalidate = () => {
      const now = Date.now();
      const elapsed = now - lastAdminEmitAt;
      if (elapsed >= REALTIME_LIMITS.ADMIN_THROTTLE_MS) {
        lastAdminEmitAt = now;
        pendingTrailingAdmin = false;
        triggerInvalidate();
        return;
      }

      pendingTrailingAdmin = true;
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
          if (pendingTrailingAdmin) {
            pendingTrailingAdmin = false;
            lastAdminEmitAt = Date.now();
            triggerInvalidate();
          }
        }, REALTIME_LIMITS.ADMIN_THROTTLE_MS - elapsed);
      }
    };

    const handleHint = (hint: RealtimeHint) => {
      if (hint.kind === 'state_changed') {
        if (hint.version <= lastVersionRef.current) {
          return;
        }
        lastVersionRef.current = hint.version;

        if (audience === 'players') {
          if (jitterTimer) clearTimeout(jitterTimer);
          const delayMs = Math.floor(
            Math.random() * REALTIME_LIMITS.PLAYER_JITTER_MAX_MS,
          );
          jitterTimer = setTimeout(() => {
            jitterTimer = null;
            triggerInvalidate();
          }, delayMs);
          return;
        }

        triggerInvalidate();
        return;
      }

      if (
        audience === 'admin' &&
        (hint.kind === 'players_changed' || hint.kind === 'answers_changed')
      ) {
        scheduleAdminThrottledInvalidate();
        return;
      }

      if (
        audience === 'lobby' &&
        (hint.kind === 'session_opened' || hint.kind === 'session_closed')
      ) {
        triggerInvalidate();
      }
    };

    const handleStatusChange = (nextStatus: RealtimeConnectionStatus) => {
      setStatus(nextStatus);
      onConnectionChangeRef.current?.(nextStatus === 'SUBSCRIBED');
      if (nextStatus === 'DISCONNECTED') {
        hadDisconnectionRef.current = true;
      }
      if (nextStatus === 'SUBSCRIBED') {
        if (hadDisconnectionRef.current || !wasSubscribedRef.current) {
          if (hadDisconnectionRef.current) {
            triggerInvalidate();
          }
          wasSubscribedRef.current = true;
          hadDisconnectionRef.current = false;
        }
      }
    };

    const unsubscribe = subscribeAdapter({
      audience,
      sessionId,
      onHint: handleHint,
      onStatusChange: handleStatusChange,
    });

    const handleOnline = () => {
      triggerInvalidate();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerInvalidate();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (jitterTimer) clearTimeout(jitterTimer);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
    // currentVersion intentionally synced via dedicated ref effect above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience, enabled, queryClient, sessionId, subscribeAdapter]);

  const effectiveStatus: RealtimeConnectionStatus =
    !enabled || (audience !== 'lobby' && !sessionId) ? 'DISCONNECTED' : status;

  return {
    status: effectiveStatus,
    isConnected: effectiveStatus === 'SUBSCRIBED',
  };
}
