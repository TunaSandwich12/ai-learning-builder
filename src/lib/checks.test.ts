import { describe, expect, test } from "vitest";
import { checkActivity } from "./checks";
import { samples } from "./samples";

describe("checkActivity", () => {
  test("samples have no problems", () => {
    for (const sample of Object.values(samples)) {
      expect(checkActivity(sample)).toEqual([]);
    }
  });

  test("flags 3 options and 2 correct answers", () => {
    const [q] = samples.multiple_choice.questions;
    const broken = {
      ...samples.multiple_choice,
      questions: [
        {
          ...q,
          options: [
            { text: "A", isCorrect: true },
            { text: "B", isCorrect: true },
            { text: "C", isCorrect: false },
          ],
        },
      ],
    };
    const problems = checkActivity(broken);
    expect(problems).toContain("question 1 has 3 options, not 4");
    expect(problems).toContain("question 1 has 2 correct options, not 1");
  });
});
