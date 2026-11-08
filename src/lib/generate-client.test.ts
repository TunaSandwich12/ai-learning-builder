import { describe, expect, test } from "vitest";
import {
  buildRefineBody,
  FALLBACK_ERROR,
  readGenerateResponse,
  type ChatMessage,
} from "./generate-client";
import { samples } from "./samples";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("readGenerateResponse", () => {
  test("returns the activity on success", async () => {
    const result = await readGenerateResponse(jsonResponse({ content: samples.multiple_choice }));
    expect(result).toEqual({ ok: true, activity: samples.multiple_choice });
  });

  test("works for every sample type", async () => {
    for (const sample of Object.values(samples)) {
      const result = await readGenerateResponse(jsonResponse({ content: sample }));
      expect(result.ok).toBe(true);
    }
  });

  test("passes through the route's error message", async () => {
    const result = await readGenerateResponse(
      jsonResponse({ error: "Please type what you'd like to create." }, 400),
    );
    expect(result).toEqual({ ok: false, message: "Please type what you'd like to create." });
  });

  test("uses the fallback when an error response has no message", async () => {
    expect(await readGenerateResponse(jsonResponse({}, 500))).toEqual({
      ok: false,
      message: FALLBACK_ERROR,
    });
    expect(await readGenerateResponse(jsonResponse({ error: "  " }, 500))).toEqual({
      ok: false,
      message: FALLBACK_ERROR,
    });
    expect(await readGenerateResponse(jsonResponse(null, 500))).toEqual({
      ok: false,
      message: FALLBACK_ERROR,
    });
  });

  test("uses the fallback when the response isn't JSON", async () => {
    const res = new Response("<html>Bad gateway</html>", { status: 502 });
    expect(await readGenerateResponse(res)).toEqual({ ok: false, message: FALLBACK_ERROR });
  });

  test("rejects success responses with the wrong shape", async () => {
    expect(await readGenerateResponse(jsonResponse({}))).toEqual({
      ok: false,
      message: FALLBACK_ERROR,
    });
    expect(
      await readGenerateResponse(jsonResponse({ content: { type: "multiple_choice", title: "Hi" } })),
    ).toEqual({ ok: false, message: FALLBACK_ERROR });
  });
});

describe("buildRefineBody", () => {
  test("sends only the last 10 messages, plus the request and current activity", () => {
    const messages: ChatMessage[] = Array.from({ length: 14 }, (_, i) => ({
      role: i % 2 === 0 ? "teacher" : "assistant",
      text: `msg ${i}`,
    }));
    const body = buildRefineBody("multiple_choice", "Make question 3 harder", messages, samples.multiple_choice);
    expect(body.type).toBe("multiple_choice");
    expect(body.request).toBe("Make question 3 harder");
    expect(body.current).toBe(samples.multiple_choice);
    expect(body.history).toHaveLength(10);
    expect(body.history[0].text).toBe("msg 4");
    expect(body.history[9].text).toBe("msg 13");
  });

  test("strips extra fields like ids from messages", () => {
    const body = buildRefineBody(
      "flashcards",
      "Add a card",
      [{ id: 1, role: "teacher", text: "hi" } as ChatMessage],
      samples.flashcards,
    );
    expect(body.history).toEqual([{ role: "teacher", text: "hi" }]);
  });
});
