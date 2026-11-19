export const GAME_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 24,
  MAX_PLAYERS: 150,
  OPTIONS_MIN: 2,
  OPTIONS_MAX: 4,
  PROMPT_MIN: 5,
  PROMPT_MAX: 500,
  OPTION_TEXT_MAX: 120,
  EXPLANATION_MAX: 500,
  TIME_LIMIT_CHOICES: [10, 15, 20, 30, 45, 60] as const,
  DEFAULT_TIME_LIMIT_S: 20,
  DEFAULT_BASE_POINTS: 1000,
  BASE_POINTS_MIN: 100,
  BASE_POINTS_MAX: 2000,
  QUESTION_LEAD_IN_MS: 3000,
  ANSWER_GRACE_MS: 500,
  LEADERBOARD_LIVE_SIZE: 10,
  LEADERBOARD_REVEAL_SIZE: 5,
  PLAYER_COOKIE_MAX_AGE_S: 43_200,
  PLAYER_BODY_MAX_BYTES: 1024,
} as const;

export const PLAYER_COOKIE_NAME = 'kuis_player';
export const PREFERENCES_STORAGE_KEY = 'kuis-keberagaman-preferences-v1';

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export const QUESTION_TYPE_LABELS = {
  true_false: 'Benar / Salah',
  multiple_choice: 'Pilihan Ganda',
} as const;

export const PHASE_LABELS = {
  lobby: 'Ruang Tunggu',
  countdown: 'Persiapan',
  question: 'Soal Aktif',
  reveal: 'Pembahasan',
  finished: 'Hasil Akhir',
  cancelled: 'Dibatalkan',
} as const;

export const GAME_COPY = {
  JOIN_LABEL: 'Nama Pemain',
  JOIN_PLACEHOLDER: 'Masukkan namamu',
  JOIN_PIN_LABEL: 'PIN Sesi (4 digit)',
  JOIN_PIN_PLACEHOLDER: 'Masukkan 4 digit PIN',
  JOIN_BUTTON: 'Gabung',
  JOIN_SUBMITTING: 'Bergabung…',
  WAITING_FOR_SESSION_TITLE: 'Menunggu sesi dibuka…',
  WAITING_FOR_SESSION_DESC:
    'Otomatis aktif begitu guru atau admin membuka sesi kuis.',
  LOBBY_BADGE: 'RUANG TUNGGU',
  LOBBY_WAITING_ADMIN: 'Menunggu admin memulai kuis…',
  COUNTDOWN_BADGE: 'SIAP-SIAP',
  COUNTDOWN_HINT:
    'Baca baik-baik — semakin cepat menjawab benar, semakin besar poinmu!',
  ANSWER_SUBMITTED_TITLE: 'Jawaban terkirim',
  ANSWER_SUBMITTED_DESC: 'Menunggu pemain lain dan hasil dibuka bersama…',
  REVEAL_CORRECT_BADGE: 'JAWABAN BENAR',
  REVEAL_WRONG_BADGE: 'BELUM TEPAT',
  REVEAL_UNANSWERED_BADGE: 'WAKTU HABIS',
  REVEAL_EXPLANATION_LABEL: 'PENJELASAN',
  REVEAL_DISTRIBUTION_LABEL: 'DISTRIBUSI JAWABAN',
  REVEAL_TOP_LEADERBOARD_LABEL: 'PERINGKAT SEMENTARA',
  FINISHED_BADGE: 'HASIL AKHIR',
  FINISHED_TITLE: 'Papan Peringkat Final',
  FINISHED_BACK_HOME: 'Kembali ke Beranda',
  CANCELLED_BADGE: 'SESI DIBATALKAN',
  CANCELLED_TITLE: 'Sesi kuis telah dibatalkan oleh admin.',
  CANCELLED_DESC: 'Silakan kembali ke beranda untuk menunggu sesi berikutnya.',
  CONNECTION_SUBSCRIBED: 'Terhubung',
  CONNECTION_RECONNECTING: 'Menyambung ulang…',
} as const;
