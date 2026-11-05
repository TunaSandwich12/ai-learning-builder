import { describe, expect, test } from "vitest";
import { activitySchema, activityTypes, multipleChoiceSchema, schemas } from "./index";
import { samples } from "../samples";

describe("activity schemas", () => {
  test.each(activityTypes)("%s sample passes its schema and the union", (type) => {
    expect(schemas[type].safeParse(samples[type]).success).toBe(true);
    expect(activitySchema.safeParse(samples[type]).success).toBe(true);
  });

  test("rejects multiple choice options given as plain strings", () => {
    const broken = {
      ...samples.multiple_choice,
      questions: [
        {
          question: "What process turns liquid water into water vapor?",
          options: ["Evaporation", "Condensation", "Precipitation", "Collection"],
          explanation: "Evaporation turns liquid water into vapor.",
        },
      ],
    };
    expect(multipleChoiceSchema.safeParse(broken).success).toBe(false);
    expect(activitySchema.safeParse(broken).success).toBe(false);
  });
});
