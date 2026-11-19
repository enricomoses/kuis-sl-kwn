import 'server-only';

import { AuthError } from './errors.server';

function getExpectedOrigin(request: Request): string {
  const url = new URL(request.url);
  const rawProto = request.headers.get('x-forwarded-proto');
  const proto = rawProto
    ? rawProto.split(',')[0].trim()
    : url.protocol.replace(':', '');

  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost) {
    return `${proto}://${forwardedHost.split(',')[0].trim()}`;
  }

  const host = request.headers.get('host');
  if (host) {
    return `${proto}://${host}`;
  }
  return url.origin;
}

export function assertSameOriginRequest(request: Request): void {
  const expectedOrigin = getExpectedOrigin(request);
  const originHeader = request.headers.get('origin');

  if (originHeader) {
    if (originHeader !== expectedOrigin) {
      throw new AuthError('CSRF_FORBIDDEN', 403);
    }
    return;
  }

  const refererHeader = request.headers.get('referer');
  if (refererHeader) {
    try {
      const refererOrigin = new URL(refererHeader).origin;
      if (refererOrigin !== expectedOrigin) {
        throw new AuthError('CSRF_FORBIDDEN', 403);
      }
      return;
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw new AuthError('CSRF_FORBIDDEN', 403);
    }
  }

  const secFetchSite = request.headers.get('sec-fetch-site');
  if (
    secFetchSite &&
    secFetchSite !== 'same-origin' &&
    secFetchSite !== 'none'
  ) {
    throw new AuthError('CSRF_FORBIDDEN', 403);
  }
}
