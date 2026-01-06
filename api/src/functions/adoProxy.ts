import type { HttpHandler, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

import { getAdoAuthorizationHeader } from '../shared/adoAuth.js';
import { getRequiredEnv } from '../shared/env.js';
import { filterDownstreamResponseHeaders, filterUpstreamRequestHeaders } from '../shared/headerFilter.js';

export function buildUpstreamUrl(org: string, path: string, queryString: string): string {
  const normalizedOrg = org.trim();
  if (!normalizedOrg) {
    throw new Error('ADO_ORG must not be empty');
  }

  const normalizedPath = (path ?? '').replace(/^\/+/, '');

  // Avoid accidental open-proxy behavior.
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    throw new Error('Absolute URLs are not allowed');
  }
  if (normalizedPath.includes('..')) {
    throw new Error('Path traversal is not allowed');
  }

  const base = `https://dev.azure.com/${encodeURIComponent(normalizedOrg)}/`;
  const qs = queryString ? (queryString.startsWith('?') ? queryString : `?${queryString}`) : '';
  return `${base}${normalizedPath}${qs}`;
}

const handler: HttpHandler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight OPTIONS requests
  if (request.method.toUpperCase() === 'OPTIONS') {
    return {
      status: 204,
      headers: corsHeaders,
    };
  }

  const org = getRequiredEnv('ADO_ORG');
  const path = request.params.path ?? '';

  const incomingUrl = new URL(request.url);

  const url = buildUpstreamUrl(org, path, incomingUrl.search);

  const authorization = await getAdoAuthorizationHeader();
  const headers = filterUpstreamRequestHeaders(request.headers as any);
  headers.set('Authorization', authorization);

  const hasBody = !['GET', 'HEAD'].includes(request.method.toUpperCase());
  const body = hasBody ? await request.arrayBuffer() : undefined;

  context.log(`ADO proxy -> ${request.method} ${url}`);

  const upstreamResponse = await fetch(url, {
    method: request.method,
    headers,
    body: body ? Buffer.from(body) : undefined,
  });

  const responseHeaders = filterDownstreamResponseHeaders(upstreamResponse.headers as any);
  const upstreamBody = await upstreamResponse.arrayBuffer();

  // Add CORS headers to response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    responseHeaders[key] = value;
  });

  return {
    status: upstreamResponse.status,
    headers: responseHeaders,
    body: Buffer.from(upstreamBody),
  };
};

export default handler;
