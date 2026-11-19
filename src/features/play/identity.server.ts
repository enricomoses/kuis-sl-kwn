import 'server-only';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import {
  getPlayerTokenPepper,
  isSecureCookieEnvironment,
} from '@/config/environment.server';
import { GAME_LIMITS, PLAYER_COOKIE_NAME } from '@/constants/game.constant';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_REGEX = /^[A-Za-z0-9_-]{32,128}$/;

export interface ParsedPlayerCookie {
  playerId: string;
  token: string;
}

export function generatePlayerToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashPlayerToken(
  token: string,
  pepperOverride?: string,
): string {
  const pepper = pepperOverride ?? getPlayerTokenPepper();
  return crypto.createHmac('sha256', pepper).update(token).digest('hex');
}

export function verifyPlayerTokenHash(
  token: string,
  expectedHash: string,
  pepperOverride?: string,
): boolean {
  const computedHex = hashPlayerToken(token, pepperOverride);
  const computedBuf = Buffer.from(computedHex, 'utf8');
  const expectedBuf = Buffer.from(expectedHash, 'utf8');
  if (computedBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(computedBuf, expectedBuf);
}

export function formatPlayerCookieValue(
  playerId: string,
  token: string,
): string {
  return `${playerId}.${token}`;
}

export function parsePlayerCookieValue(
  rawValue: string | undefined | null,
): ParsedPlayerCookie | null {
  if (!rawValue) return null;
  const dotIndex = rawValue.indexOf('.');
  if (dotIndex <= 0 || dotIndex !== rawValue.lastIndexOf('.')) {
    return null;
  }
  const playerId = rawValue.slice(0, dotIndex);
  const token = rawValue.slice(dotIndex + 1);
  if (!UUID_REGEX.test(playerId) || !TOKEN_REGEX.test(token)) {
    return null;
  }
  return { playerId, token };
}

export async function readPlayerCookie(): Promise<ParsedPlayerCookie | null> {
  const store = await cookies();
  const raw = store.get(PLAYER_COOKIE_NAME)?.value;
  return parsePlayerCookieValue(raw);
}

export function setPlayerCookie(
  response: NextResponse,
  playerId: string,
  token: string,
): void {
  response.cookies.set(
    PLAYER_COOKIE_NAME,
    formatPlayerCookieValue(playerId, token),
    {
      httpOnly: true,
      secure: isSecureCookieEnvironment(),
      sameSite: 'lax',
      path: '/',
      maxAge: GAME_LIMITS.PLAYER_COOKIE_MAX_AGE_S,
    },
  );
}
