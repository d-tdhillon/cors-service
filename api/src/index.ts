import 'dotenv/config';
import { app } from '@azure/functions';

import healthz from './functions/healthz.js';
import adoProxy from './functions/adoProxy.js';

app.http('healthz', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'healthz',
  handler: healthz,
});

app.http('adoProxy', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'ado/{*path}',
  handler: adoProxy,
});
