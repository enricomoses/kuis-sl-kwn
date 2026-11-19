export interface AdminQueryIdentity {
  userId: string;
  role: 'admin';
}

export function toAdminQueryIdentity(
  profile: AdminQueryIdentity | null | undefined,
): AdminQueryIdentity | null {
  return profile
    ? {
        userId: profile.userId,
        role: profile.role,
      }
    : null;
}

function adminScopedKey<
  const Scope extends string,
  const Extra extends readonly unknown[],
>(scope: Scope, identity: AdminQueryIdentity | null, ...extra: Extra) {
  return [
    'kuis',
    'admin',
    scope,
    identity?.userId ?? 'anon',
    identity?.role ?? 'none',
    ...extra,
  ] as const;
}

const ROOT_KEY = ['kuis'] as const;
const ADMIN_ROOT = ['kuis', 'admin'] as const;

export const QUERY_KEYS = {
  ROOT: ROOT_KEY,
  PLAY_ME: ['kuis', 'play', 'me'] as const,
  PLAY_STATE: ['kuis', 'play', 'state'] as const,
  ADMIN_ROOT,
  ADMIN_SESSION: (identity: AdminQueryIdentity | null) =>
    adminScopedKey('session', identity),
  ADMIN_QUESTIONS: (identity: AdminQueryIdentity | null) =>
    adminScopedKey('questions', identity),
  ADMIN_GAME: (identity: AdminQueryIdentity | null) =>
    adminScopedKey('game', identity),
  ADMIN_LEADERBOARD: (identity: AdminQueryIdentity | null) =>
    adminScopedKey('leaderboard', identity),
  ADMIN_HISTORY: (identity: AdminQueryIdentity | null) =>
    adminScopedKey('history', identity),
  ADMIN_RESULTS: (identity: AdminQueryIdentity | null, sessionId: string) =>
    adminScopedKey('results', identity, sessionId),
} as const;

export const STALE_TIME = {
  LIVE: 0,
  ADMIN_FRESH: 0,
} as const;

export const QUERY_LIMITS = {
  RETRIES: 1,
  GC_TIME_MS: 300_000,
  ADMIN_GC_TIME_MS: 60_000,
} as const;
