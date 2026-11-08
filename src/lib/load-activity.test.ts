import { describe, expect, test } from "vitest";
import { activityIdSchema, parseSavedRow, parseSharedRow } from "./load-activity";
import { samples } from "./samples";

const ID = "3f2b8c1e-5d4a-4b6e-9c7f-1a2b3c4d5e6f";
const TEACHER = "teacher-1";

describe("parseSavedRow", () => {
  test("returns the activity for the owner's valid row", () => {
    for (const sample of Object.values(samples)) {
      expect(parseSavedRow({ id: ID, owner_id: TEACHER, content: sample }, TEACHER)).toEqual(sample);
    }
  });

  test("returns null for another teacher's row", () => {
    const row = { id: ID, owner_id: "teacher-2", content: samples.flashcards };
    expect(parseSavedRow(row, TEACHER)).toBeNull();
  });

  test("another teacher's SHARED row still can't be opened in the editor", () => {
    // The "anyone reads shared" policy lets a logged-in teacher read it,
    // so the owner check here is what keeps it out of their editor.
    const row = { id: ID, owner_id: "teacher-2", content: samples.flashcards, is_public: true };
    expect(parseSavedRow(row, TEACHER)).toBeNull();
  });

  test("returns null for a missing row", () => {
    expect(parseSavedRow(null, TEACHER)).toBeNull();
  });

  test.each([
    ["empty content", {}],
    ["an unknown type", { ...samples.flashcards, type: "test" }],
    ["a missing field", { ...samples.ordering, items: undefined }],
    ["null", null],
  ])("returns null for %s", (_label, content) => {
    expect(parseSavedRow({ id: ID, owner_id: TEACHER, content }, TEACHER)).toBeNull();
  });
});

describe("activityIdSchema", () => {
  test("accepts a UUID and rejects other strings", () => {
    expect(activityIdSchema.safeParse(ID).success).toBe(true);
    expect(activityIdSchema.safeParse("new").success).toBe(false);
    expect(activityIdSchema.safeParse("").success).toBe(false);
  });
});

describe("parseSharedRow", () => {
  test("returns the activity for valid content", () => {
    for (const sample of Object.values(samples)) {
      expect(parseSharedRow({ content: sample })).toEqual(sample);
    }
  });

  test.each([
    ["a missing row", null],
    ["empty content", { content: {} }],
    ["an unknown type", { content: { ...samples.flashcards, type: "test" } }],
    ["null content", { content: null }],
  ])("returns null for %s", (_label, row) => {
    expect(parseSharedRow(row)).toBeNull();
  });
});
