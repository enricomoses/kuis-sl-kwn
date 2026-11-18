import 'server-only';

import { ServerDomainError } from '@/features/auth/errors.server';
import type { ApiErrorCode } from '@/types';

const RPC_ERROR_STATUS_MAP: Partial<Record<ApiErrorCode, number>> = {
  NO_ACTIVE_SESSION: 404,
  SESSION_LOCKED: 409,
  SESSION_FULL: 409,
  NAME_TAKEN: 409,
  NAME_INVALID: 422,
  INVALID_PIN: 403,
  NOT_JOINED: 401,
  ANSWER_CLOSED: 409,
  ANSWER_TOO_EARLY: 409,
  STALE_QUESTION: 409,
  INVALID_OPTION: 422,
  CONFLICT: 409,
  NO_QUESTIONS: 409,
  ACTIVE_SESSION_EXISTS: 409,
  INVALID_REQUEST: 400,
};

export class GameError extends ServerDomainError {
  constructor(
    code: ApiErrorCode,
    status: number,
    options?: {
      message?: string;
      fieldErrors?: Record<string, string[]>;
    },
  ) {
    super(code, status, options);
    this.name = 'GameError';
  }
}

export function mapRpcError(message: string | undefined): GameError {
  const normalized = (message ?? '').trim() as ApiErrorCode;
  const status = RPC_ERROR_STATUS_MAP[normalized];
  if (status) {
    const fieldErrors =
      normalized === 'NAME_TAKEN' || normalized === 'NAME_INVALID'
        ? { name: [] as string[] }
        : normalized === 'INVALID_PIN'
          ? { pin: [] as string[] }
          : undefined;
    const err = new GameError(normalized, status);
    if (fieldErrors) {
      const key = Object.keys(fieldErrors)[0];
      return new GameError(normalized, status, {
        fieldErrors: { [key]: [err.message] },
      });
    }
    return err;
  }
  return new GameError('UPSTREAM_ERROR', 503);
}
