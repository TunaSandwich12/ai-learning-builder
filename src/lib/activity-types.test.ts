import { describe, expect, test } from "vitest";
import { activityTypeOptions } from "./activity-types";
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
