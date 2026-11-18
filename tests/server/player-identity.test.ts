import { describe, expect, it } from 'vitest';
import {
  formatPlayerCookieValue,
  generatePlayerToken,
  hashPlayerToken,
  parsePlayerCookieValue,
  verifyPlayerTokenHash,
} from '@/features/play/identity.server';

const TEST_PEPPER = 'test-pepper-at-least-32-characters-long-123456';

describe('player identity cookie & HMAC', () => {
  it('generates, hashes, and verifies tokens using timingSafeEqual', () => {
    const token = generatePlayerToken();
    const hash = hashPlayerToken(token, TEST_PEPPER);

    expect(verifyPlayerTokenHash(token, hash, TEST_PEPPER)).toBe(true);
    expect(verifyPlayerTokenHash('wrong-token', hash, TEST_PEPPER)).toBe(false);
    expect(
      verifyPlayerTokenHash(
        token,
        hash,
        'different-pepper-at-least-32-characters-long',
      ),
    ).toBe(false);
  });

  it('formats and parses valid player cookie values and rejects malformed ones', () => {
    const playerId = '11111111-1111-4111-8111-111111111111';
    const token = generatePlayerToken();
    const formatted = formatPlayerCookieValue(playerId, token);

    expect(parsePlayerCookieValue(formatted)).toEqual({ playerId, token });
    expect(parsePlayerCookieValue('not-a-uuid.short')).toBeNull();
    expect(parsePlayerCookieValue(`${playerId}.${token}.extra`)).toBeNull();
    expect(parsePlayerCookieValue(undefined)).toBeNull();
  });
});
