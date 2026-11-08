import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Replace messages.parse so no test can ever call the real API.
const { parseMock } = vi.hoisted(() => ({ parseMock: vi.fn() }));
vi.mock("@anthropic-ai/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@anthropic-ai/sdk")>();
  class FakeAnthropic extends actual.default {
    // Overrides the real resource; error classes stay real (inherited statics).
    override messages = { parse: parseMock } as unknown as InstanceType<typeof actual.default>["messages"];
  }
  return { ...actual, default: FakeAnthropic };
});

import Anthropic from "@anthropic-ai/sdk";
import { samples } from "../samples";
import type { GenerateRequest } from "../schemas/generate-request";
import { buildUserMessage, generateActivity, MESSAGES } from "./generate";

const baseInput: GenerateRequest = {
  type: "multiple_choice",
  request: "Make a Grade 5 quiz on the water cycle",
  history: [],
  current: null,
};

function okResponse(parsed: unknown, stop_reason = "end_turn") {
  return { id: "msg_test", stop_reason, stop_details: null, parsed_output: parsed };
}

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key-not-real");
  // Belt and braces: any real network call fails loudly.
  vi.stubGlobal("fetch", () => {
    throw new Error("Tests must not call the network");
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
  parseMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("buildUserMessage", () => {
  test("includes type and request, omits empty history and current", () => {
    const msg = buildUserMessage(baseInput);
    expect(msg).toContain("<activity_type>multiple_choice</activity_type>");
    expect(msg).toContain("Make a Grade 5 quiz on the water cycle");
    expect(msg).not.toContain("<chat_history>");
    expect(msg).not.toContain("<current_activity>");
  });

  test("includes history and current activity when present", () => {
    const msg = buildUserMessage({
      ...baseInput,
      request: "Make question 2 easier",
      history: [
        { role: "teacher", text: "Make a quiz" },
        { role: "assistant", text: "Here is your quiz." },
      ],
      current: samples.multiple_choice,
    });
    expect(msg).toContain("Teacher: Make a quiz\nAssistant: Here is your quiz.");
    expect(msg).toContain("<current_activity>");
    expect(msg).toContain(samples.multiple_choice.title);
    expect(msg).toContain("keep everything they didn't ask to change");
    // The request comes last.
    expect(msg.trim().endsWith("</teacher_request>")).toBe(true);
  });
});

describe("generateActivity", () => {
  test("returns the parsed activity and sends the right request", async () => {
    parseMock.mockResolvedValue(okResponse(samples.multiple_choice));

    const result = await generateActivity(baseInput);

    expect(result).toEqual({ ok: true, activity: samples.multiple_choice });
    const params = parseMock.mock.calls[0][0];
    expect(params.model).toBe("claude-sonnet-5-5");
    expect(params.max_tokens).toBe(8000);
    expect(params.output_config.format).toBeDefined();
    expect(params).not.toHaveProperty("output_format");
    expect(params.messages[0].role).toBe("user");
  });

  test("missing key: friendly message, no API call", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const result = await generateActivity(baseInput);
    expect(result).toEqual({ ok: false, status: 502, message: MESSAGES.badKey });
    expect(parseMock).not.toHaveBeenCalled();
  });

  test.each([
    ["401", new Anthropic.AuthenticationError(401, undefined, "bad key", new Headers()), 502, MESSAGES.badKey],
    ["403", new Anthropic.PermissionDeniedError(403, undefined, "forbidden", new Headers()), 502, MESSAGES.badKey],
    ["429", new Anthropic.RateLimitError(429, undefined, "slow down", new Headers()), 429, MESSAGES.busy],
    ["500", new Anthropic.InternalServerError(500, undefined, "boom", new Headers()), 500, MESSAGES.generic],
    ["timeout", new Anthropic.APIConnectionTimeoutError(), 500, MESSAGES.generic],
    ["plain Error", new Error("weird"), 500, MESSAGES.generic],
  ])("%s error maps to a friendly message and is logged", async (_name, error, status, message) => {
    parseMock.mockRejectedValue(error);
    const result = await generateActivity(baseInput);
    expect(result).toEqual({ ok: false, status, message });
    expect(console.error).toHaveBeenCalled();
  });

  test.each(["refusal", "max_tokens"])("stop_reason %s gives the generic message", async (reason) => {
    parseMock.mockResolvedValue(okResponse(samples.multiple_choice, reason));
    const result = await generateActivity(baseInput);
    expect(result).toEqual({ ok: false, status: 500, message: MESSAGES.generic });
  });

  test("null parsed_output gives the generic message", async () => {
    parseMock.mockResolvedValue(okResponse(null));
    const result = await generateActivity(baseInput);
    expect(result).toEqual({ ok: false, status: 500, message: MESSAGES.generic });
  });

  test("activity that fails the checks gives the generic message", async () => {
    const broken = {
      ...samples.multiple_choice,
      questions: [{ ...samples.multiple_choice.questions[0], options: [] }],
    };
    parseMock.mockResolvedValue(okResponse(broken));
    const result = await generateActivity(baseInput);
    expect(result).toEqual({ ok: false, status: 500, message: MESSAGES.generic });
  });
});
