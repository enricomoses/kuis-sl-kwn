import { z } from 'zod';

const realtimeHintKindSchema = z.enum([
  'session_opened',
  'session_closed',
  'state_changed',
  'players_changed',
  'answers_changed',
]);

export const realtimeHintSchema = z.strictObject({
  kind: realtimeHintKindSchema,
  version: z.int().min(0),
});
