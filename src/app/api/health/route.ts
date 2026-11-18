import { z } from 'zod';
import { createSuccessResponse } from '@/lib/response.server';

const healthSchema = z.strictObject({
  status: z.literal('ok'),
  timestamp: z.iso.datetime(),
});

export function GET() {
  const requestId = crypto.randomUUID();
  return createSuccessResponse(
    healthSchema,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    requestId,
  );
}
