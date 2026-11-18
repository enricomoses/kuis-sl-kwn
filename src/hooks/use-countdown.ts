'use client';

import { useEffect, useRef, useState } from 'react';
import { REALTIME_LIMITS } from '@/constants/realtime.constant';
import { computeRemainingMs, formatRemainingSeconds } from '@/utils/game-timer';

interface UseCountdownOptions {
  targetIso: string | null | undefined;
  serverNowIso?: string | null;
  offsetMs: number;
  active: boolean;
  jitterMaxMs?: number;
  onExpiredRefetch?: () => void;
  onThresholdAnnounce?: (seconds: number) => void;
}

function initialRemainingFromServer(
  targetIso: string | null | undefined,
  serverNowIso: string | null | undefined,
): number {
  if (!targetIso || !serverNowIso) return 0;
  const targetMs = Date.parse(targetIso);
  const serverMs = Date.parse(serverNowIso);
  if (Number.isNaN(targetMs) || Number.isNaN(serverMs)) return 0;
  return Math.max(0, targetMs - serverMs);
}

export function useCountdown({
  targetIso,
  serverNowIso,
  offsetMs,
  active,
  jitterMaxMs = 0,
  onExpiredRefetch,
  onThresholdAnnounce,
}: UseCountdownOptions): {
  remainingMs: number;
  remainingSeconds: number;
} {
  const [sample, setSample] = useState<{ targetIso: string; ms: number }>(
    () => ({
      targetIso: targetIso ?? '',
      ms: active ? initialRemainingFromServer(targetIso, serverNowIso) : 0,
    }),
  );

  // Store offset & callbacks in refs so minor RTT jitter never resets retry/announcement state
  const offsetMsRef = useRef(offsetMs);
  const onExpiredRef = useRef(onExpiredRefetch);
  const onAnnounceRef = useRef(onThresholdAnnounce);

  useEffect(() => {
    offsetMsRef.current = offsetMs;
  }, [offsetMs]);

  useEffect(() => {
    onExpiredRef.current = onExpiredRefetch;
  }, [onExpiredRefetch]);

  useEffect(() => {
    onAnnounceRef.current = onThresholdAnnounce;
  }, [onThresholdAnnounce]);

  useEffect(() => {
    if (!active || !targetIso) {
      return;
    }

    let rafId: number | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let lastTickPaint = 0;
    let expiredTriggered = false;
    let retriesDone = 0;
    const announcedThresholds = new Set<number>();

    const scheduleExpiredRetries = () => {
      if (!onExpiredRef.current) return;
      const runRetry = () => {
        if (retriesDone >= REALTIME_LIMITS.TIMEUP_MAX_RETRIES) return;
        retriesDone += 1;
        onExpiredRef.current?.();
        if (retriesDone < REALTIME_LIMITS.TIMEUP_MAX_RETRIES) {
          retryTimer = setTimeout(
            runRetry,
            REALTIME_LIMITS.TIMEUP_RETRY_MS * retriesDone,
          );
        }
      };

      const initialDelay =
        jitterMaxMs > 0 ? Math.floor(Math.random() * jitterMaxMs) : 0;
      retryTimer = setTimeout(runRetry, initialDelay);
    };

    const tick = () => {
      const next = computeRemainingMs(
        targetIso,
        Date.now(),
        offsetMsRef.current,
      );
      setSample({ targetIso, ms: next });

      const secs = formatRemainingSeconds(next);
      if (
        (secs === 10 || secs === 5) &&
        !announcedThresholds.has(secs) &&
        onAnnounceRef.current
      ) {
        announcedThresholds.add(secs);
        onAnnounceRef.current(secs);
      }

      if (next <= 0 && !expiredTriggered) {
        expiredTriggered = true;
        scheduleExpiredRetries();
      }
    };

    tick();

    const loop = (timestamp: number) => {
      if (timestamp - lastTickPaint >= 120) {
        lastTickPaint = timestamp;
        tick();
      }
      rafId = window.requestAnimationFrame(loop);
    };

    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      rafId = window.requestAnimationFrame(loop);
    }

    fallbackInterval = setInterval(tick, 250);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [active, jitterMaxMs, targetIso]);

  const effectiveMs =
    !active || !targetIso
      ? 0
      : sample.targetIso === targetIso
        ? sample.ms
        : initialRemainingFromServer(targetIso, serverNowIso);

  return {
    remainingMs: effectiveMs,
    remainingSeconds: formatRemainingSeconds(effectiveMs),
  };
}
