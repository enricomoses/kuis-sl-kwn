import { describe, expect, it } from 'vitest';
import {
  computeOffset,
  computeRemainingMs,
  formatRemainingSeconds,
} from '@/utils/game-timer';

describe('game-timer utilities', () => {
  it('computes clock offset corrected by half RTT', () => {
    // Client starts at 1000ms, receives at 1200ms (RTT 200ms -> midpoint 1100ms).
    // Server says 6100ms -> server is +5000ms ahead of client.
    const serverIso = new Date(6100).toISOString();
    expect(computeOffset(serverIso, 1000, 1200)).toBe(5000);
  });

  it('computes remaining milliseconds using server offset', () => {
    const targetIso = new Date(25_000).toISOString();
    // Client clock is 10_000, server is +5_000 ahead => effective server now is 15_000 => 10_000 remaining
    expect(computeRemainingMs(targetIso, 10_000, 5_000)).toBe(10_000);
    // Clamps to 0 after target passes
    expect(computeRemainingMs(targetIso, 25_000, 5_000)).toBe(0);
  });

  it('formats remaining seconds rounded up', () => {
    expect(formatRemainingSeconds(0)).toBe(0);
    expect(formatRemainingSeconds(1)).toBe(1);
    expect(formatRemainingSeconds(1400)).toBe(2);
    expect(formatRemainingSeconds(20_000)).toBe(20);
  });
});
