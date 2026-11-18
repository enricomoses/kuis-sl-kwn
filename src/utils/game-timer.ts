/**
 * Compute server-to-client clock offset corrected by half RTT (PRD §5.4).
 * Positive offset means server clock is ahead of client clock.
 */
export function computeOffset(
  serverNowIso: string,
  requestStartedMs: number,
  responseReceivedMs: number,
): number {
  const serverMs = Date.parse(serverNowIso);
  if (Number.isNaN(serverMs)) return 0;
  const rttMs = Math.max(0, responseReceivedMs - requestStartedMs);
  const estimatedClientAtServerMs = requestStartedMs + rttMs / 2;
  return Math.round(serverMs - estimatedClientAtServerMs);
}

/**
 * Compute remaining milliseconds until `targetIso` using synced offset.
 */
export function computeRemainingMs(
  targetIso: string | null | undefined,
  nowMs: number,
  offsetMs: number,
): number {
  if (!targetIso) return 0;
  const targetMs = Date.parse(targetIso);
  if (Number.isNaN(targetMs)) return 0;
  const adjustedNow = nowMs + offsetMs;
  return Math.max(0, targetMs - adjustedNow);
}

/**
 * Format milliseconds as whole seconds rounded up (e.g., 1400ms -> 2).
 */
export function formatRemainingSeconds(remainingMs: number): number {
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / 1000);
}
