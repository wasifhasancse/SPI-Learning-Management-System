import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

process.env.SERVER_URL = "https://api.example.test";
const { fetchCourses, fetchCourseById, fetchLectures, fetchLecturesByCourse, getJwtToken, createLecture } = await import("../src/lib/api.ts");
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

test("public catalog reuses recent requests and refreshes after expiry or a lecture change", async () => {
  const originalNow = Date.now;
  let now = 1000;
  let reads = 0;
  Date.now = () => now;
  globalThis.fetch = async (_url, options) => {
    if (options?.method === "POST") return Response.json({ success: true, data: {} });
    reads++;
    return Response.json({ success: true, data: [{ id: reads }] });
  };
  try {
    const [first, concurrent] = await Promise.all([
      fetchCourses({ preferCache: true }),
      fetchCourses({ preferCache: true }),
    ]);
    assert.deepEqual(first, concurrent);
    assert.equal(reads, 1);
    assert.deepEqual(await fetchCourses({ preferCache: true }), first);
    assert.equal(reads, 1);

    now += 15_000;
    assert.equal((await fetchCourses({ preferCache: true }))[0].id, 2);
    await createLecture(1, { title: "New lesson" }, "token");
    assert.equal((await fetchCourses({ preferCache: true }))[0].id, 3);
    assert.equal((await fetchCourses())[0].id, 4);
  } finally {
    Date.now = originalNow;
  }
});

test("invalidated in-flight catalog reads cannot restore stale data", async () => {
  let finishRead;
  globalThis.fetch = async (_url, options) => {
    if (options?.method === "POST") return Response.json({ success: true, data: {} });
    return new Promise((resolve) => { finishRead = resolve; });
  };
  await createLecture(1, { title: "Reset" }, "token");
  const staleRead = fetchCourses({ preferCache: true });
  await createLecture(1, { title: "New lesson" }, "token");
  finishRead(Response.json({ success: true, data: [{ id: 1 }] }));
  await staleRead;

  globalThis.fetch = async () => Response.json({ success: true, data: [{ id: 2 }] });
  assert.equal((await fetchCourses({ preferCache: true }))[0].id, 2);
});

test("failed cached catalog requests can be retried", async () => {
  globalThis.fetch = async () => Response.json({ success: true, data: {} });
  await createLecture(1, { title: "Reset" }, "token");
  globalThis.fetch = async () => new Response(null, { status: 503 });
  await assert.rejects(fetchCourses({ preferCache: true }), /HTTP 503/);
  globalThis.fetch = async () => Response.json({ success: true, data: [{ id: 3 }] });
  assert.equal((await fetchCourses({ preferCache: true }))[0].id, 3);
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
