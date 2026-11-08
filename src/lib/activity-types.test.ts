import { describe, expect, test } from "vitest";
import { activityTypeLabel, activityTypeOptions } from "./activity-types";
import { activityTypes } from "./schemas";

describe("activityTypeOptions", () => {
  test("lists all five types in order", () => {
    expect(activityTypeOptions.map((o) => o.type)).toEqual([...activityTypes]);
  });

  test("every type has a label, description and placeholder", () => {
    for (const option of activityTypeOptions) {
      expect(option.label.trim()).not.toBe("");
      expect(option.description.trim()).not.toBe("");
      expect(option.placeholder.trim()).not.toBe("");
    }
  });
});

describe("activityTypeLabel", () => {
  test("gives each type in words", () => {
    expect(activityTypeLabel("multiple_choice")).toBe("Multiple choice");
    expect(activityTypeLabel("true_false")).toBe("True or false");
    expect(activityTypeLabel("flashcards")).toBe("Flashcards");
    expect(activityTypeLabel("matching")).toBe("Matching");
    expect(activityTypeLabel("ordering")).toBe("Ordering");
  });

  test("falls back to the stored value for an unknown type", () => {
    expect(activityTypeLabel("essay")).toBe("essay");
    expect(activityTypeLabel("toString")).toBe("toString");
  });
});
