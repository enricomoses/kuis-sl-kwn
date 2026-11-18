import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountdown } from '@/hooks/use-countdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-19T06:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps announcement & expired retry state intact across minor offsetMs jitter', () => {
    const onExpiredRefetch = vi.fn();
    const onThresholdAnnounce = vi.fn();
    const targetIso = '2026-11-19T06:00:06.000Z';
    const serverNowIso = '2026-11-19T06:00:00.000Z';

    const { result, rerender } = renderHook(
      ({ offsetMs }: { offsetMs: number }) =>
        useCountdown({
          targetIso,
          serverNowIso,
          offsetMs,
          active: true,
          jitterMaxMs: 0,
          onExpiredRefetch,
          onThresholdAnnounce,
        }),
      { initialProps: { offsetMs: 0 } },
    );

    expect(result.current.remainingSeconds).toBe(6);

    // Advance 1.2s -> hits 5 seconds threshold once
    act(() => {
      vi.advanceTimersByTime(1250);
    });
    expect(onThresholdAnnounce).toHaveBeenCalledTimes(1);
    expect(onThresholdAnnounce).toHaveBeenCalledWith(5);

    // Jitter offsetMs slightly -> MUST NOT re-announce 5s
    rerender({ offsetMs: 15 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onThresholdAnnounce).toHaveBeenCalledTimes(1);

    // Advance past expiration and through all 5 backoff retries
    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(onExpiredRefetch).toHaveBeenCalledTimes(5);

    // Further offsetMs jitter after cap MUST NOT trigger infinite extra retries
    rerender({ offsetMs: 22 });
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(onExpiredRefetch).toHaveBeenCalledTimes(5);
  });
});
