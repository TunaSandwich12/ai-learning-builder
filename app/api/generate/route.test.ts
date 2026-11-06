import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { samples } from "@/src/lib/samples";

const getClaims = vi.fn();
vi.mock("@/src/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getClaims } }),
}));

// Never reach the real AI module from route tests.
const generateActivity = vi.fn();
vi.mock("@/src/lib/ai/generate", () => ({ generateActivity }));

const { POST, maxDuration } = await import("./route");

function post(body: unknown) {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const valid = { type: "true_false", request: "Water cycle facts" };

describe("POST /api/generate", () => {
  beforeEach(() => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "teacher-1" } } });
    vi.stubEnv("FAKE_MODE", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
    getClaims.mockReset();
    generateActivity.mockReset();
  });

  test("allows up to 60 seconds", () => {
    expect(maxDuration).toBe(60);
  });

  test("401 when not logged in", async () => {
    getClaims.mockResolvedValue({ data: null });
    const res = await POST(post(valid));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Please log in to create activities." });
  });

  test("400 for invalid JSON", async () => {
    const res = await POST(post("{not json"));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/couldn't read/);
  });

  test("400 with a friendly message for an invalid body", async () => {
    const res = await POST(post({ type: "true_false", request: "" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Please type what you'd like to create." });
  });

  test("400 when the request is missing", async () => {
    const res = await POST(post({ type: "true_false" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Please type what you'd like to create." });
  });

  test("400 for an unknown activity type", async () => {
    const res = await POST(post({ type: "essay", request: "Water cycle facts" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Please choose an activity type." });
  });

  test("fake mode returns the sample for the type after a short wait", async () => {
    vi.useFakeTimers();
    const pending = POST(post(valid));
    await vi.advanceTimersByTimeAsync(700);
    const res = await pending;
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ content: samples.true_false });
    expect(generateActivity).not.toHaveBeenCalled();
  });

  test("real mode returns the generated activity", async () => {
    vi.stubEnv("FAKE_MODE", "false");
    generateActivity.mockResolvedValue({ ok: true, activity: samples.true_false });
    const res = await POST(post(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ content: samples.true_false });
    expect(generateActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: "true_false", request: "Water cycle facts", history: [], current: null }),
    );
  });

  test("real mode passes on the friendly error", async () => {
    vi.stubEnv("FAKE_MODE", "false");
    generateActivity.mockResolvedValue({
      ok: false,
      status: 429,
      message: "The AI is busy, try again in a minute",
    });
    const res = await POST(post(valid));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "The AI is busy, try again in a minute" });
  });

  test("500 with a friendly message on unexpected errors", async () => {
    getClaims.mockRejectedValue(new Error("boom"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(post(valid));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Something went wrong. Please try again." });
  });
});
