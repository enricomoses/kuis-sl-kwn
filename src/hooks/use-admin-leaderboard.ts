'use client';

import { useState } from 'react';
import {
  QUERY_KEYS,
  toAdminQueryIdentity,
} from '@/constants/query-keys.constant';
import { useAdminLeaderboardState } from '@/hooks/queries/use-admin-game';
import { useSessionRealtime } from '@/hooks/use-session-realtime';
import type { AdminSessionProfile } from '@/types/auth';
import type { AdminLeaderboardState } from '@/types/game';

export function useAdminLeaderboard(
  profile: AdminSessionProfile,
  initialState: AdminLeaderboardState | null,
) {
  const identity = toAdminQueryIdentity(profile);
  const queryKey = QUERY_KEYS.ADMIN_LEADERBOARD(identity);
  const [lobbyConnected, setLobbyConnected] = useState(false);
  const [sessionConnected, setSessionConnected] = useState(false);

  const query = useAdminLeaderboardState({
    profile,
    initialData: initialState,
    lobbyConnected,
    sessionConnected,
  });

  const state = query.data ?? null;
  const isActiveSession =
    state?.session.status === 'lobby' || state?.session.status === 'running';

  // Always listen to lobby events so newly opened or closed sessions appear immediately
  useSessionRealtime({
    audience: 'lobby',
    queryKey,
    enabled: true,
    onConnectionChange: setLobbyConnected,
  });

  // Listen to active session events (answers, joins, kicks, phase transitions)
  useSessionRealtime({
    audience: 'admin',
    sessionId: isActiveSession ? (state?.session.id ?? null) : null,
    queryKey,
    enabled: Boolean(isActiveSession && state?.session.id),
    currentVersion: state?.version ?? -1,
    onConnectionChange: setSessionConnected,
  });

  return {
    state,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
