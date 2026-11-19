export const API_ENDPOINTS = {
  BASE: '/api',
  HEALTH: '/health',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  ADMIN_SESSION: '/admin/session',
  PLAY_ME: '/play/me',
  PLAY_JOIN: '/play/join',
  PLAY_STATE: '/play/state',
  PLAY_ANSWER: '/play/answer',
  ADMIN_QUESTIONS: '/admin/questions',
  ADMIN_QUESTION_DETAIL: (id: string) =>
    `/admin/questions/${encodeURIComponent(id)}`,
  ADMIN_QUESTIONS_REORDER: '/admin/questions/reorder',
  ADMIN_GAME: '/admin/game',
  ADMIN_GAME_LEADERBOARD: '/admin/game/leaderboard',
  ADMIN_GAME_ACTIONS: (id: string) =>
    `/admin/game/${encodeURIComponent(id)}/actions`,
  ADMIN_GAME_KICK_PLAYER: (id: string, playerId: string) =>
    `/admin/game/${encodeURIComponent(id)}/players/${encodeURIComponent(playerId)}`,
  ADMIN_GAME_HISTORY: '/admin/game/history',
  ADMIN_GAME_RESULTS: (id: string) =>
    `/admin/game/${encodeURIComponent(id)}/results`,
  ADMIN_GAME_EXPORT: (id: string) =>
    `/admin/game/${encodeURIComponent(id)}/export`,
} as const;
