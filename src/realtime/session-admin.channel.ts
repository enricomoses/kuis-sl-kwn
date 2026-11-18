'use client';

import {
  REALTIME_CHANNELS,
  REALTIME_EVENT_NAME,
} from '@/constants/realtime.constant';
import { getRealtimeClient } from '@/lib/supabase/realtime-client';
import type { RealtimeConnectionStatus, RealtimeHint } from '@/types/game';
import { realtimeHintSchema } from '@/validations/realtime.schema';

export interface AdminSessionChannelOptions {
  sessionId: string;
  onHint: (hint: RealtimeHint) => void;
  onStatusChange: (status: RealtimeConnectionStatus) => void;
}

function mapSubscribeStatus(status: string): RealtimeConnectionStatus {
  if (status === 'SUBSCRIBED') return 'SUBSCRIBED';
  if (
    status === 'CLOSED' ||
    status === 'CHANNEL_ERROR' ||
    status === 'TIMED_OUT'
  ) {
    return 'DISCONNECTED';
  }
  return 'CONNECTING';
}

export function subscribeSessionAdminChannel(
  options: AdminSessionChannelOptions,
): () => void {
  options.onStatusChange('CONNECTING');
  let client: ReturnType<typeof getRealtimeClient>;
  try {
    client = getRealtimeClient();
  } catch {
    options.onStatusChange('DISCONNECTED');
    return () => {};
  }

  const channel = client
    .channel(REALTIME_CHANNELS.sessionAdmin(options.sessionId))
    .on('broadcast', { event: REALTIME_EVENT_NAME }, ({ payload }) => {
      const parsed = realtimeHintSchema.safeParse(payload);
      if (!parsed.success) return;
      if (
        parsed.data.kind === 'state_changed' ||
        parsed.data.kind === 'players_changed' ||
        parsed.data.kind === 'answers_changed'
      ) {
        options.onHint(parsed.data);
      }
    })
    .subscribe((status) => {
      options.onStatusChange(mapSubscribeStatus(status));
    });

  return () => {
    void client.removeChannel(channel);
  };
}
