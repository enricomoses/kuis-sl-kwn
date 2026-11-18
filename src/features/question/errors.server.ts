import 'server-only';

import { ServerDomainError } from '@/features/auth/errors.server';
import type { ApiErrorCode } from '@/types';

export class QuestionError extends ServerDomainError {
  constructor(
    code: ApiErrorCode,
    status: number,
    options?: {
      message?: string;
      fieldErrors?: Record<string, string[]>;
    },
  ) {
    super(code, status, options);
    this.name = 'QuestionError';
  }
}
