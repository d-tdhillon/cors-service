import type { HttpHandler, HttpMethod, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export const handler: HttpHandler = async (_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
  return {
    status: 200,
    jsonBody: { ok: true },
    headers: { 'content-type': 'application/json' },
  };
};

export const healthz = {
  methods: ['GET'] as HttpMethod[],
  authLevel: 'anonymous' as const,
  route: 'healthz',
  handler,
};
