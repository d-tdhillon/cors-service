const DISALLOWED_REQUEST_HEADERS = new Set([
  'authorization',
  'cookie',
  'host',
  'connection',
  'content-length',
]);

const DISALLOWED_RESPONSE_HEADERS = new Set([
  'set-cookie',
  'transfer-encoding',
  'connection',
]);

export function filterUpstreamRequestHeaders(incoming: unknown): Headers {
  const headers = new Headers();

  const iterable: Iterable<[string, string]> =
    typeof (incoming as any)?.entries === 'function' ? ((incoming as any).entries() as Iterable<[string, string]>) : (incoming as any);

  for (const [key, value] of iterable) {
    const lower = key.toLowerCase();
    if (DISALLOWED_REQUEST_HEADERS.has(lower)) continue;

    // Allow-list-ish: keep common safe headers and any `if-*` precondition headers.
    if (
      lower === 'accept' ||
      lower === 'content-type' ||
      lower === 'content-encoding' ||
      lower === 'if-match' ||
      lower === 'if-none-match' ||
      lower === 'if-modified-since' ||
      lower === 'if-unmodified-since'
    ) {
      headers.set(key, value);
      continue;
    }

    // Pass through custom request IDs etc.
    if (lower.startsWith('x-')) {
      headers.set(key, value);
    }
  }

  return headers;
}

export function filterDownstreamResponseHeaders(upstream: unknown): Record<string, string> {
  const headers: Record<string, string> = {};

  const iterable: Iterable<[string, string]> =
    typeof (upstream as any)?.entries === 'function' ? ((upstream as any).entries() as Iterable<[string, string]>) : (upstream as any);

  for (const [key, value] of iterable) {
    const lower = key.toLowerCase();
    if (DISALLOWED_RESPONSE_HEADERS.has(lower)) continue;

    if (
      lower === 'content-type' ||
      lower === 'content-length' ||
      lower === 'etag' ||
      lower === 'cache-control' ||
      lower === 'pragma' ||
      lower === 'expires' ||
      lower === 'last-modified' ||
      lower === 'location' ||
      lower.startsWith('x-')
    ) {
      headers[key] = value;
    }
  }

  return headers;
}
