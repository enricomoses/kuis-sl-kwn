'use client';

import {
  REALTIME_CHANNELS,
  REALTIME_EVENT_NAME,
} from '@/constants/realtime.constant';
import { getRealtimeClient } from '@/lib/supabase/realtime-client';
import type { RealtimeConnectionStatus, RealtimeHint } from '@/types/game';
import { realtimeHintSchema } from '@/validations/realtime.schema';

export interface ChannelSubscriptionOptions {
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

export function subscribeLobbyChannel(
  options: ChannelSubscriptionOptions,
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
    .channel(REALTIME_CHANNELS.LOBBY)
    .on('broadcast', { event: REALTIME_EVENT_NAME }, ({ payload }) => {
      const parsed = realtimeHintSchema.safeParse(payload);
      if (!parsed.success) return;
      if (
        parsed.data.kind === 'session_opened' ||
        parsed.data.kind === 'session_closed'
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
