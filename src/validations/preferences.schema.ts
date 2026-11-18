import { z } from 'zod';
import { GAME_LIMITS } from '@/constants/game.constant';

export const preferencesSchema = z.strictObject({
  lastPlayerName: z
    .string()
    .trim()
    .max(GAME_LIMITS.NAME_MAX)
    .nullable()
    .default(null),
  hideLiveScores: z.boolean().default(false),
});
