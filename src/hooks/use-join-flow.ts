'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { QUERY_KEYS } from '@/constants/query-keys.constant';
import { ROUTES } from '@/constants/routes.constant';
import { useJoinSession, usePlayMe } from '@/hooks/queries/use-play';
import { useSessionRealtime } from '@/hooks/use-session-realtime';
import { ApiClientError } from '@/lib/errors';
import { notifyError } from '@/lib/toast';
import {
  usePreferences,
  usePreferencesHydrated,
} from '@/providers/preferences-provider';
import type { PlayMeResponse } from '@/types/game';
import { joinRequestSchema } from '@/validations/game.schema';

type JoinFormInputValues = z.input<typeof joinRequestSchema>;
type JoinFormOutputValues = z.output<typeof joinRequestSchema>;

export function useJoinFlow(initialMe?: PlayMeResponse) {
  const router = useRouter();
  const lastPlayerName = usePreferences((s) => s.lastPlayerName);
  const setLastPlayerName = usePreferences((s) => s.setLastPlayerName);
  const prefsHydrated = usePreferencesHydrated();

  const realtime = useSessionRealtime({
    audience: 'lobby',
    queryKey: QUERY_KEYS.PLAY_ME,
    enabled: true,
  });

  const meQuery = usePlayMe({
    initialData: initialMe,
    realtimeConnected: realtime.isConnected,
  });

  const joinMutation = useJoinSession();

  const form = useForm<JoinFormInputValues, unknown, JoinFormOutputValues>({
    resolver: zodResolver(joinRequestSchema),
    defaultValues: {
      name: '',
      pin: '',
    },
  });

  // Prefill last player name once preferences rehydrate on the client
  useEffect(() => {
    if (!prefsHydrated || !lastPlayerName) return;
    if (!form.getValues('name')) {
      form.setValue('name', lastPlayerName, { shouldDirty: false });
    }
  }, [form, lastPlayerName, prefsHydrated]);

  // If already joined in the active session, move directly to /play
  useEffect(() => {
    if (meQuery.data?.player && meQuery.data.session) {
      router.replace(ROUTES.PLAY);
    }
  }, [meQuery.data, router]);

  async function onSubmit(values: JoinFormOutputValues) {
    try {
      await joinMutation.mutateAsync({
        name: values.name,
        ...(values.pin ? { pin: values.pin } : {}),
      });
      setLastPlayerName(values.name);
      router.replace(ROUTES.PLAY);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (
          err.code === 'NAME_TAKEN' ||
          err.code === 'NAME_INVALID' ||
          err.fieldErrors?.name?.[0]
        ) {
          form.setError('name', {
            message: err.fieldErrors?.name?.[0] ?? err.message,
          });
          return;
        }
        if (err.code === 'INVALID_PIN' || err.fieldErrors?.pin?.[0]) {
          form.setError('pin', {
            message: err.fieldErrors?.pin?.[0] ?? err.message,
          });
          return;
        }
        notifyError(err.message, { toastId: `join-error-${err.code}` });
        return;
      }
      notifyError('Gagal bergabung ke sesi kuis. Silakan coba lagi.', {
        toastId: 'join-error-network',
      });
    }
  }

  const activeSession = meQuery.data?.session ?? null;

  return {
    form,
    activeSession,
    requiresPin: Boolean(activeSession?.requiresPin),
    isLocked:
      activeSession?.status === 'running' && !activeSession.allowLateJoin,
    isLoadingMe: meQuery.isLoading,
    isSubmitting: form.formState.isSubmitting || joinMutation.isPending,
    onSubmit,
  };
}
