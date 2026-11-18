import 'server-only';

interface ServerLogEvent {
  requestId: string;
  route: string;
  operation: string;
  status: number;
  durationMs: number;
  level?: 'info' | 'warn' | 'error';
  code?: string;
  sessionId?: string;
  playerId?: string;
  detail?: string;
}

export function logServerEvent(event: ServerLogEvent) {
  const payload = {
    timestamp: new Date().toISOString(),
    level: event.level ?? (event.status >= 500 ? 'error' : 'info'),
    ...event,
  };
  const line = JSON.stringify(payload);
  if (payload.level === 'error') {
    console.error(line);
  } else if (payload.level === 'warn') {
    console.warn(line);
  } else {
    console.info(line);
  }
}
