import type { HttpHandler, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

const handler: HttpHandler = async (_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
  return {
    status: 200,
    jsonBody: { ok: true },
    headers: { 'content-type': 'application/json' },
  };
};

export default handler;
