import type { ERROR_COPY } from '@/constants/copy.constant';

export type ApiErrorCode = keyof typeof ERROR_COPY;

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  requestId: string;
  meta?: ApiMeta;
}
