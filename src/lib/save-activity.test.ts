import { describe, expect, test } from "vitest";
import { samples } from "./samples";
import { SAVE_MESSAGES, validateSave } from "./save-activity";

const UUID = "3f2b8c1e-5d4a-4b6e-9c7f-1a2b3c4d5e6f";

describe("validateSave", () => {
  test("every sample is accepted and becomes a row", () => {
    for (const sample of Object.values(samples)) {
      const result = validateSave(null, sample);
      expect(result).toEqual({
        ok: true,
        id: null,
        row: { type: sample.type, title: sample.title, content: sample },
      });
    }
  });

  test("accepts a UUID id and keeps it", () => {
    const result = validateSave(UUID, samples.flashcards);
    expect(result.ok && result.id).toBe(UUID);
  });

  test.each([["abc"], [""], [123], [undefined], [{}]])("rejects id %j", (id) => {
    expect(validateSave(id, samples.flashcards)).toEqual({
      ok: false,
      message: SAVE_MESSAGES.badId,
    });
  });

  test("trims the title column", () => {
    const result = validateSave(null, { ...samples.ordering, title: "  Steps  " });
    expect(result.ok && result.row.title).toBe("Steps");
  });

  test.each([
    ["an unknown type", { ...samples.flashcards, type: "essay" }],
    ["a missing field", { ...samples.multiple_choice, questions: undefined }],
    ["a wrong field type", { ...samples.true_false, statements: "nope" }],
    ["null", null],
    ["a string", "activity"],
  ])("rejects %s with the friendly message", (_label, activity) => {
    const result = validateSave(null, activity);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe(SAVE_MESSAGES.invalid);
  });

  test("rejects activities that fail checkActivity", () => {
    const [q] = samples.multiple_choice.questions;
    const cases = [
      { ...samples.flashcards, title: "   " },
      {
        ...samples.multiple_choice,
        questions: [{ ...q, options: q.options.slice(0, 3) }],
      },
      {
        ...samples.multiple_choice,
        questions: [{ ...q, options: q.options.map((o) => ({ ...o, isCorrect: true })) }],
      },
      { ...samples.ordering, items: [] },
    ];
    for (const activity of cases) {
      const result = validateSave(null, activity);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe(SAVE_MESSAGES.invalid);
        expect(result.problems?.length).toBeGreaterThan(0);
      }
    }
  });

  test("drops owner_id and other extra keys sent from the browser", () => {
    const result = validateSave(null, {
      ...samples.matching,
      owner_id: "someone-else",
      id: UUID,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.row).not.toHaveProperty("owner_id");
      expect(result.row.content).not.toHaveProperty("owner_id");
      expect(result.row.content).not.toHaveProperty("id");
      expect(Object.keys(result.row).sort()).toEqual(["content", "title", "type"]);
    }
  });
});
