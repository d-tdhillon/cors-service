import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { buildUpstreamUrl } from '../dist/src/functions/adoProxy.js';
import healthzHandler from '../dist/src/functions/healthz.js';

test('buildUpstreamUrl builds expected ADO URL', () => {
  const url = buildUpstreamUrl('myorg', 'proj/_apis/projects', 'api-version=7.1');
  assert.equal(url, 'https://dev.azure.com/myorg/proj/_apis/projects?api-version=7.1');
});

test('buildUpstreamUrl rejects absolute URLs', () => {
  assert.throws(() => buildUpstreamUrl('org', 'https://evil.example', ''), /Absolute URLs/);
});

test('buildUpstreamUrl rejects traversal', () => {
  assert.throws(() => buildUpstreamUrl('org', '../secret', ''), /Path traversal/);
});

test('healthz handler returns ok', async () => {
  const mockRequest = { method: 'GET' };
  const mockContext = {};
  const response = await healthzHandler(mockRequest, mockContext);
  assert.equal(response.status, 200);
  assert.equal(response.jsonBody?.ok, true);
});
