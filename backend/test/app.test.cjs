const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');

process.env.CLIENT_URL = 'https://frontend.example.test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
process.env.NODE_ENV = 'production';
delete process.env.PORT;
require('dotenv').config = () => ({});

test('root entry exports the API without starting a server', async () => {
  const originalListen = express.application.listen;
  express.application.listen = () => { throw new Error('Entry started a listener when imported'); };
  let app;
  try {
    app = require('../dist/index.js').default;
  } finally {
    express.application.listen = originalListen;
  }
  assert.equal(typeof app, 'function');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const root = await fetch(`${base}/`);
    assert.equal(root.status, 200);
    assert.equal((await root.json()).status, 'ok');
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, 'ok');
    const preflight = await fetch(`${base}/api/courses`, {
      method: 'OPTIONS',
      headers: { Origin: process.env.CLIENT_URL, 'Access-Control-Request-Method': 'POST' }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), process.env.CLIENT_URL);
    const protectedRoute = await fetch(`${base}/api/courses`, { method: 'POST' });
    assert.equal(protectedRoute.status, 401);
    const missing = await fetch(`${base}/not-found`);
    assert.equal(missing.status, 404);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
