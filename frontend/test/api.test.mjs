import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

process.env.SERVER_URL = "https://api.example.test";
const { fetchCourses, fetchCourseById, fetchLectures, fetchLecturesByCourse, getJwtToken } = await import("../src/lib/api.ts");
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("catalog reads return actual data, including an empty list", async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: [] });
  assert.deepEqual(await fetchCourses(), []);
  assert.deepEqual(await fetchLectures(), []);
  assert.deepEqual(await fetchLecturesByCourse(1), []);
});

test("catalog reads reject HTTP, network, and invalid response failures", async () => {
  globalThis.fetch = async () => new Response(null, { status: 503 });
  await assert.rejects(fetchCourses(), /HTTP 503/);
  await assert.rejects(fetchLectures(), /HTTP 503/);
  await assert.rejects(fetchLecturesByCourse(1), /HTTP 503/);
  await assert.rejects(fetchCourseById(1), /HTTP 503/);

  globalThis.fetch = async () => { throw new Error("Network unavailable"); };
  await assert.rejects(fetchCourses(), /Network unavailable/);

  globalThis.fetch = async () => Response.json({ success: true });
  await assert.rejects(fetchCourses(), /Invalid courses response/);
});

test("a missing course remains a not-found result", async () => {
  globalThis.fetch = async () => new Response(null, { status: 404 });
  assert.equal(await fetchCourseById(1), null);
});

test("token retrieval distinguishes signed-out sessions from service failures", async () => {
  globalThis.fetch = async () => new Response(null, { status: 401 });
  assert.equal(await getJwtToken(), null);

  globalThis.fetch = async () => new Response(null, { status: 500 });
  await assert.rejects(getJwtToken(), /authorization token \(HTTP 500\)/);

  globalThis.fetch = async () => Response.json({});
  await assert.rejects(getJwtToken(), /invalid token/);

  globalThis.fetch = async () => Response.json({ token: "test-token" });
  assert.equal(await getJwtToken(), "test-token");
});
