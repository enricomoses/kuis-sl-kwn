import { describe, expect, it, vi } from 'vitest';
import { publishHint } from '@/features/realtime/publisher.server';

describe('realtime publisher (best-effort)', () => {
  it('publishes valid hint without throwing', async () => {
    const sendBroadcast = vi.fn().mockResolvedValue(undefined);
    const ok = await publishHint(
      'kuis:lobby',
      { kind: 'session_opened', version: 1 },
      'req-1',
      { sendBroadcast },
    );
    expect(ok).toBe(true);
    expect(sendBroadcast).toHaveBeenCalledWith(
      'kuis:lobby',
      { kind: 'session_opened', version: 1 },
      1500,
    );
  });

  it('swallows broadcast errors and returns false so main request succeeds', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const sendBroadcast = vi
      .fn()
      .mockRejectedValue(new Error('Realtime timeout'));

    const ok = await publishHint(
      'kuis:lobby',
      { kind: 'session_opened', version: 2 },
      'req-2',
      { sendBroadcast },
    );

    expect(ok).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
