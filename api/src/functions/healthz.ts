import type { HttpHandler, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

const handler: HttpHandler = async (request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight OPTIONS requests
  if (request.method.toUpperCase() === 'OPTIONS') {
    return {
      status: 204,
      headers: corsHeaders,
    };
  }

  return {
    status: 200,
    jsonBody: { ok: true },
    headers: {
      'content-type': 'application/json',
      ...corsHeaders,
    },
  };
};

export default handler;
