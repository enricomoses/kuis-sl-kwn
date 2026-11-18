'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  QUERY_KEYS,
  toAdminQueryIdentity,
} from '@/constants/query-keys.constant';
import { authService } from '@/services/auth.service';
import type { LoginRequest } from '@/types/auth';

export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (response) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.ADMIN_ROOT });
      const { profile } = response.data;
      queryClient.setQueryData(
        QUERY_KEYS.ADMIN_SESSION(toAdminQueryIdentity(profile)),
        profile,
      );
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.ADMIN_ROOT });
    },
  });
}
