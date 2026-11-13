import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { NextRequest } from "next/server.js";

globalThis.proxyTestAuth = { api: { getSession: async () => null } };
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@/lib/auth") {
      return { url: "data:text/javascript,export const auth = globalThis.proxyTestAuth", shortCircuit: true };
    }
    if (specifier === "next/server") {
      return nextResolve("next/server.js", context);
    }
    return nextResolve(specifier, context);
  }
});
const { proxy } = await import("../src/proxy.ts");
hooks.deregister();

test("dashboard requests redirect when the session is missing or invalid", async () => {
  let headers;
  globalThis.proxyTestAuth.api.getSession = async (options) => {
    headers = options.headers;
    assert.deepEqual(options.query, { disableCookieCache: true, disableRefresh: true });
    return null;
  };
  for (const path of ["/admin", "/admin/courses", "/dashboard"]) {
    const response = await proxy(new NextRequest(`https://example.test${path}`, {
      headers: { cookie: "better-auth.session_token=invalid" }
    }));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), "https://example.test/admin/login");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(headers.get("cookie"), "better-auth.session_token=invalid");
  }
});

test("validated sessions can access the dashboard and the login page stays public", async () => {
  let calls = 0;
  globalThis.proxyTestAuth.api.getSession = async () => {
    calls++;
    return { user: { id: "1" } };
  };
  assert.equal((await proxy(new NextRequest("https://example.test/admin/lectures"))).headers.get("x-middleware-next"), "1");
  for (const path of ["/admin/login", "/admin/login/"]) {
    assert.equal((await proxy(new NextRequest(`https://example.test${path}`))).headers.get("x-middleware-next"), "1");
  }
  assert.equal(calls, 1);
});

test("session verification errors fail closed with a service error", async () => {
  globalThis.proxyTestAuth.api.getSession = async () => { throw new Error("Session service unavailable"); };
  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args);
  try {
    const response = await proxy(new NextRequest("https://example.test/admin"));
    assert.equal(response.status, 503);
    assert.match(await response.text(), /Unable to verify your session/);
    assert.equal(errors.length, 1);
  } finally {
    console.error = originalError;
  }
});
