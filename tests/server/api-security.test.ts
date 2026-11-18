import { describe, expect, it } from 'vitest';
import { GET as healthGet } from '@/app/api/health/route';
import { assertSameOriginRequest } from '@/features/auth/csrf.server';
import { AuthError } from '@/features/auth/errors.server';
import {
  InvalidJsonBodyError,
  PayloadTooLargeError,
  readBoundedJsonBody,
} from '@/lib/request-body.server';

describe('API route security primitives', () => {
  it('allows same-origin requests and blocks cross-origin requests', () => {
    const sameOriginReq = new Request(
      'https://kuis.petra.ac.id/api/play/join',
      {
        method: 'POST',
        headers: {
          host: 'kuis.petra.ac.id',
          origin: 'https://kuis.petra.ac.id',
        },
      },
    );
    expect(() => assertSameOriginRequest(sameOriginReq)).not.toThrow();

    const crossOriginReq = new Request(
      'https://kuis.petra.ac.id/api/play/join',
      {
        method: 'POST',
        headers: {
          host: 'kuis.petra.ac.id',
          origin: 'https://evil.example',
        },
      },
    );
    expect(() => assertSameOriginRequest(crossOriginReq)).toThrow(AuthError);
  });

  it('enforces byte limit and valid JSON in readBoundedJsonBody', async () => {
    const oversized = new Request('http://localhost:3000/api/play/join', {
      method: 'POST',
      body: JSON.stringify({ name: 'a'.repeat(1500) }),
    });
    await expect(readBoundedJsonBody(oversized, 1024)).rejects.toThrow(
      PayloadTooLargeError,
    );

    const invalidJson = new Request('http://localhost:3000/api/play/join', {
      method: 'POST',
      body: '{invalid',
    });
    await expect(readBoundedJsonBody(invalidJson, 1024)).rejects.toThrow(
      InvalidJsonBodyError,
    );
  });

  it('returns standard envelope with no-store header from GET /api/health', async () => {
    const response = healthGet();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const json = (await response.json()) as {
      ok: boolean;
      data: { status: string };
      requestId: string;
    };
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe('ok');
    expect(json.requestId.length).toBeGreaterThan(0);
  });
});
