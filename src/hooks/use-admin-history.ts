'use client';

import { useState } from 'react';
import { API_ENDPOINTS } from '@/constants/endpoint.constant';
import {
  useAdminHistory,
  useAdminSessionResults,
} from '@/hooks/queries/use-admin-game';
import type { AdminSessionProfile } from '@/types/auth';
import type { SessionHistoryResponse } from '@/types/game';

export function useAdminHistoryManager(
  profile: AdminSessionProfile,
  initialData?: SessionHistoryResponse,
) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const historyQuery = useAdminHistory(profile, initialData);
  const resultsQuery = useAdminSessionResults(profile, selectedSessionId);

  function getExportUrl(sessionId: string): string {
    return `${API_ENDPOINTS.BASE}${API_ENDPOINTS.ADMIN_GAME_EXPORT(sessionId)}`;
  }

  return {
    items: historyQuery.data?.items ?? [],
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    refetch: historyQuery.refetch,
    selectedSessionId,
    openResults: (sessionId: string) => setSelectedSessionId(sessionId),
    closeResults: () => setSelectedSessionId(null),
    results: resultsQuery.data ?? null,
    isResultsLoading: resultsQuery.isLoading,
    isResultsError: resultsQuery.isError,
    getExportUrl,
  };
}
