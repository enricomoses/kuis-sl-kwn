import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GAME_COPY } from '@/constants/game.constant';
import type { RealtimeConnectionStatus } from '@/types/game';

interface ConnectionBadgeProps {
  status: RealtimeConnectionStatus;
  className?: string;
}

export function ConnectionBadge({ status, className }: ConnectionBadgeProps) {
  const connected = status === 'SUBSCRIBED';

  return (
    <Badge
      tone={connected ? 'blue' : 'coral'}
      className={className}
      aria-live="polite"
    >
      {connected ? (
        <Wifi size={14} aria-hidden="true" />
      ) : (
        <WifiOff size={14} aria-hidden="true" />
      )}
      <span>
        {connected
          ? GAME_COPY.CONNECTION_SUBSCRIBED
          : GAME_COPY.CONNECTION_RECONNECTING}
      </span>
    </Badge>
  );
}
