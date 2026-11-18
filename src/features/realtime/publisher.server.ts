import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnvironment } from '@/config/environment.client';
import { REALTIME_EVENT_NAME } from '@/constants/realtime.constant';
import { LIMITS } from '@/constants/validation.constant';
import { logServerEvent } from '@/lib/logger.server';
import type { Database } from '@/types/database';
import type { RealtimeHint } from '@/types/game';
import { realtimeHintSchema } from '@/validations/realtime.schema';

export interface PublishHintDependencies {
  sendBroadcast?: (
    channelName: string,
    hint: RealtimeHint,
    timeoutMs: number,
  ) => Promise<void>;
}

async function defaultSendBroadcast(
  channelName: string,
  hint: RealtimeHint,
  timeoutMs: number,
): Promise<void> {
  const { url, publishableKey } = getSupabaseEnvironment();
  const client = createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: 'no-store',
          signal: init?.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(timeoutMs)])
            : AbortSignal.timeout(timeoutMs),
        }),
    },
  });

  const channel = client.channel(channelName);
  try {
    const result = await channel.httpSend(REALTIME_EVENT_NAME, hint, {
      timeout: timeoutMs,
    });
    if (!result.success) {
      throw new Error(result.error || 'Broadcast send failed');
    }
  } finally {
    await client.removeChannel(channel);
  }
}

/**
 * Best-effort Realtime Broadcast publisher (PRD §7.3).
 * Never throws; logs failures with structured observability event `publish_failed`.
 */
export async function publishHint(
  channelName: string,
  hint: RealtimeHint,
  requestId: string,
  deps?: PublishHintDependencies,
): Promise<boolean> {
  const startedAt = Date.now();
  const parsed = realtimeHintSchema.safeParse(hint);
  if (!parsed.success) {
    logServerEvent({
      requestId,
      route: 'realtime:publisher',
      operation: 'publish_failed',
      status: 400,
      durationMs: Date.now() - startedAt,
      level: 'warn',
      detail: `Invalid hint payload for channel ${channelName}`,
    });
    return false;
  }

  const sender = deps?.sendBroadcast ?? defaultSendBroadcast;
  try {
    await sender(channelName, parsed.data, LIMITS.REALTIME_PUBLISH_TIMEOUT_MS);
    return true;
  } catch (error) {
    logServerEvent({
      requestId,
      route: 'realtime:publisher',
      operation: 'publish_failed',
      status: 503,
      durationMs: Date.now() - startedAt,
      level: 'warn',
      detail:
        error instanceof Error
          ? `${channelName}: ${error.message}`
          : `${channelName}: unknown publish error`,
    });
    return false;
  }
}
