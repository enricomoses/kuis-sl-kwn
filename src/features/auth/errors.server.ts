import 'server-only';

import { ERROR_COPY } from '@/constants/copy.constant';
import type { ApiErrorCode } from '@/types';

export class ServerDomainError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    code: ApiErrorCode,
    status: number,
    options?: {
      message?: string;
      fieldErrors?: Record<string, string[]>;
    },
  ) {
    super(options?.message ?? ERROR_COPY[code]);
    this.name = 'ServerDomainError';
    this.code = code;
    this.status = status;
    this.fieldErrors = options?.fieldErrors;
  }
}

export class AuthError extends ServerDomainError {
  constructor(
    code: ApiErrorCode,
    status: number,
    options?: {
      message?: string;
      fieldErrors?: Record<string, string[]>;
    },
  ) {
    super(code, status, options);
    this.name = 'AuthError';
  }
}
