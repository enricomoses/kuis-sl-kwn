import { describe, expect, it } from 'vitest';
import { resolvePhase } from '@/utils/game-phase';

describe('resolvePhase', () => {
  const started = '2026-11-19T06:00:03.000Z';
  const ends = '2026-11-19T06:00:23.000Z';

  it('returns lobby when status is lobby', () => {
    expect(
      resolvePhase(
        {
          status: 'lobby',
          questionStartedAt: null,
          questionEndsAt: null,
          questionClosedAt: null,
        },
        Date.parse('2026-11-19T06:00:00.000Z'),
      ),
    ).toBe('lobby');
  });

  it('returns countdown when running and now < questionStartedAt', () => {
    expect(
      resolvePhase(
        {
          status: 'running',
          questionStartedAt: started,
          questionEndsAt: ends,
          questionClosedAt: null,
        },
        Date.parse('2026-11-19T06:00:01.000Z'),
      ),
    ).toBe('countdown');
  });

  it('returns question when running and started <= now <= ends with no closedAt', () => {
    expect(
      resolvePhase(
        {
          status: 'running',
          questionStartedAt: started,
          questionEndsAt: ends,
          questionClosedAt: null,
        },
        Date.parse('2026-11-19T06:00:10.000Z'),
      ),
    ).toBe('question');
  });

  it('returns reveal when running and now > ends', () => {
    expect(
      resolvePhase(
        {
          status: 'running',
          questionStartedAt: started,
          questionEndsAt: ends,
          questionClosedAt: null,
        },
        Date.parse('2026-11-19T06:00:23.001Z'),
      ),
    ).toBe('reveal');
  });

  it('returns reveal immediately when questionClosedAt is set', () => {
    expect(
      resolvePhase(
        {
          status: 'running',
          questionStartedAt: started,
          questionEndsAt: ends,
          questionClosedAt: '2026-11-19T06:00:09.000Z',
        },
        Date.parse('2026-11-19T06:00:10.000Z'),
      ),
    ).toBe('reveal');
  });

  it('returns finished and cancelled for terminal statuses', () => {
    expect(
      resolvePhase(
        {
          status: 'finished',
          questionStartedAt: started,
          questionEndsAt: ends,
          questionClosedAt: null,
        },
        Date.parse('2026-11-19T06:01:00.000Z'),
      ),
    ).toBe('finished');

    expect(
      resolvePhase(
        {
          status: 'cancelled',
          questionStartedAt: null,
          questionEndsAt: null,
          questionClosedAt: null,
        },
        Date.parse('2026-11-19T06:01:00.000Z'),
      ),
    ).toBe('cancelled');
  });
});
