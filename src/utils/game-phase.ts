import type { GamePhase, SessionStatus } from '@/types/game';

export interface PhaseSessionSnapshot {
  status: SessionStatus;
  questionStartedAt: string | null;
  questionEndsAt: string | null;
  questionClosedAt: string | null;
}

/**
 * Pure lazy phase resolution (PRD §6.1).
 * Derives UI/game phase from stored session status, server timestamps, and server clock `nowMs`.
 */
export function resolvePhase(
  session: PhaseSessionSnapshot,
  nowMs: number,
): GamePhase {
  if (session.status === 'lobby') return 'lobby';
  if (session.status === 'finished') return 'finished';
  if (session.status === 'cancelled') return 'cancelled';

  const startedMs = session.questionStartedAt
    ? Date.parse(session.questionStartedAt)
    : Number.NaN;
  const endsMs = session.questionEndsAt
    ? Date.parse(session.questionEndsAt)
    : Number.NaN;

  if (!Number.isNaN(startedMs) && nowMs < startedMs) {
    return 'countdown';
  }

  if (
    session.questionClosedAt !== null ||
    (!Number.isNaN(endsMs) && nowMs > endsMs)
  ) {
    return 'reveal';
  }

  return 'question';
}
