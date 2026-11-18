export const REALTIME_LIMITS = {
  ADMIN_THROTTLE_MS: 400,
  PLAYER_JITTER_MAX_MS: 250,
  FALLBACK_POLL_MS: 3000,
  LOBBY_POLL_MS: 5000,
  TIMEUP_RETRY_MS: 300,
  TIMEUP_MAX_RETRIES: 5,
} as const;

export const REALTIME_EVENT_NAME = 'hint' as const;

export const REALTIME_CHANNELS = {
  LOBBY: 'kuis:lobby',
  sessionPlayers: (sessionId: string) => `kuis:s:${sessionId}:players`,
  sessionAdmin: (sessionId: string) => `kuis:s:${sessionId}:admin`,
} as const;
