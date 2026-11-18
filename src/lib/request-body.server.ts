import 'server-only';

export class PayloadTooLargeError extends Error {
  constructor() {
    super('PAYLOAD_TOO_LARGE');
    this.name = 'PayloadTooLargeError';
  }
}

export class InvalidJsonBodyError extends Error {
  constructor() {
    super('INVALID_REQUEST');
    this.name = 'InvalidJsonBodyError';
  }
}

async function readBoundedUtf8Body(
  request: Request,
  maxBytes: number,
): Promise<string> {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const parsedLength = Number.parseInt(contentLength, 10);
    if (!Number.isNaN(parsedLength) && parsedLength > maxBytes) {
      throw new PayloadTooLargeError();
    }
  }

  const stream = request.body;
  if (!stream) return '';

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new PayloadTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder('utf-8', { fatal: true }).decode(merged);
}

export async function readBoundedJsonBody(
  request: Request,
  maxBytes: number,
): Promise<unknown> {
  let rawText: string;
  try {
    rawText = await readBoundedUtf8Body(request, maxBytes);
  } catch (err) {
    if (err instanceof PayloadTooLargeError) throw err;
    throw new InvalidJsonBodyError();
  }

  if (!rawText.trim()) {
    throw new InvalidJsonBodyError();
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    throw new InvalidJsonBodyError();
  }
}
