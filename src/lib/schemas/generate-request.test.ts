import { describe, expect, test } from "vitest";
import {
  friendlyValidationMessage,
  generateRequestSchema,
  MAX_REQUEST_LENGTH,
} from "./generate-request";
import { samples } from "../samples";

const valid = { type: "flashcards", request: "Water cycle vocab for grade 5" };

function messageFor(input: unknown) {
  const result = generateRequestSchema.safeParse(input);
  if (result.success) throw new Error("expected failure");
  return friendlyValidationMessage(result.error);
}

describe("generateRequestSchema", () => {
  test("accepts a minimal body and fills defaults", () => {
    const result = generateRequestSchema.parse(valid);
    expect(result.history).toEqual([]);
    expect(result.current).toBeNull();
  });

  test("accepts history and a matching current activity", () => {
    const result = generateRequestSchema.safeParse({
      ...valid,
      history: [
        { role: "teacher", text: "Make flashcards" },
        { role: "assistant", text: "Here you go" },
      ],
      current: samples.flashcards,
    });
    expect(result.success).toBe(true);
  });

  test("rejects an empty or whitespace-only request", () => {
    expect(messageFor({ ...valid, request: "   " })).toBe(
      "Please type what you'd like to create.",
    );
  });

  test("rejects a missing request", () => {
    expect(messageFor({ type: "flashcards" })).toBe("Please type what you'd like to create.");
  });

  test("rejects a request over the limit", () => {
    expect(messageFor({ ...valid, request: "a".repeat(MAX_REQUEST_LENGTH + 1) })).toMatch(
      /too long/,
    );
  });

  test("accepts a request exactly at the limit", () => {
    const result = generateRequestSchema.safeParse({
      ...valid,
      request: "a".repeat(MAX_REQUEST_LENGTH),
    });
    expect(result.success).toBe(true);
  });

  test("rejects an unknown type", () => {
    expect(messageFor({ ...valid, type: "essay" })).toBe("Please choose an activity type.");
  });

  test("rejects a bad history role with a generic message", () => {
    expect(messageFor({ ...valid, history: [{ role: "student", text: "hi" }] })).toMatch(
      /Something is wrong/,
    );
  });

  test("rejects a current activity of a different type", () => {
    expect(messageFor({ ...valid, current: samples.matching })).toMatch(/doesn't match/);
  });
});
