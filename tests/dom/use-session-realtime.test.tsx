import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSessionRealtime } from '@/hooks/use-session-realtime';
import type { SubscribeAdapterParams } from '@/hooks/use-session-realtime';
import type { RealtimeConnectionStatus, RealtimeHint } from '@/types/game';

describe('useSessionRealtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invalidates on monotonic state_changed, throttles admin burst hints, and refetches on reconnect', () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    let capturedOnHint: ((hint: RealtimeHint) => void) | null = null;
    let capturedOnStatus: ((status: RealtimeConnectionStatus) => void) | null =
      null;
    const unsubscribeSpy = vi.fn();

    const subscribeAdapter = (params: SubscribeAdapterParams) => {
      capturedOnHint = params.onHint;
      capturedOnStatus = params.onStatusChange;
      params.onStatusChange('SUBSCRIBED');
      return unsubscribeSpy;
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result, unmount } = renderHook(
      () =>
        useSessionRealtime({
          audience: 'admin',
          sessionId: '11111111-1111-4111-8111-111111111111',
          queryKey: ['kuis', 'admin', 'game'],
          currentVersion: 1,
          subscribeAdapter,
        }),
      { wrapper },
    );

    expect(result.current.isConnected).toBe(true);

    // Stale state_changed (version <= 1) is ignored
    act(() => {
      capturedOnHint?.({ kind: 'state_changed', version: 1 });
    });
    expect(invalidateSpy).not.toHaveBeenCalled();

    // Newer state_changed triggers invalidate immediately for admin
    act(() => {
      capturedOnHint?.({ kind: 'state_changed', version: 2 });
    });
    expect(invalidateSpy).toHaveBeenCalledTimes(1);

    // Burst of 5 answers_changed hints -> leading + trailing throttle (400ms)
    act(() => {
      vi.advanceTimersByTime(500);
      capturedOnHint?.({ kind: 'answers_changed', version: 2 });
      capturedOnHint?.({ kind: 'answers_changed', version: 2 });
      capturedOnHint?.({ kind: 'answers_changed', version: 2 });
      capturedOnHint?.({ kind: 'answers_changed', version: 2 });
    });
    expect(invalidateSpy).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(invalidateSpy).toHaveBeenCalledTimes(3);

    // Disconnect then reconnect triggers full refetch
    act(() => {
      capturedOnStatus?.('DISCONNECTED');
    });
    expect(result.current.isConnected).toBe(false);

    act(() => {
      capturedOnStatus?.('SUBSCRIBED');
    });
    expect(result.current.isConnected).toBe(true);
    expect(invalidateSpy).toHaveBeenCalledTimes(4);

    unmount();
    expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
  });
});
