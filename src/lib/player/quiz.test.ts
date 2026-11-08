import { describe, expect, test } from "vitest";
import { samples } from "@/src/lib/samples";
import { initialQuizState, quizReducer, type QuizAction, type QuizRules, type QuizState } from "./quiz";
import { scoreMessage, scoreText } from "./score";

function runner<P>(rules: QuizRules<P>) {
  return (actions: QuizAction<P>[], from: QuizState<P> = initialQuizState<P>()) =>
    actions.reduce((s, a) => quizReducer(rules, s, a), from);
}

// Multiple choice: the pick is an option number.
const { questions } = samples.multiple_choice;
const mcRules: QuizRules<number> = {
  count: questions.length,
  isRight: (i, option) => questions[i].options[option]?.isCorrect === true,
  isValid: (i, option) => option >= 0 && option < questions[i].options.length,
};
const mc = runner(mcRules);
const correctIndex = (qi: number) => questions[qi].options.findIndex((o) => o.isCorrect);
const wrongIndex = (qi: number) => questions[qi].options.findIndex((o) => !o.isCorrect);

/** Answers every question: right for the first `rightCount`, wrong after. */
function playThrough(rightCount: number) {
  return mc(
    questions.flatMap((_, qi) => [
      { type: "pick", pick: qi < rightCount ? correctIndex(qi) : wrongIndex(qi) } as const,
      { type: "next" } as const,
    ]),
  );
}

describe("quizReducer (multiple choice)", () => {
  test("a right pick adds to the score; a wrong one doesn't", () => {
    expect(mc([{ type: "pick", pick: correctIndex(0) }])).toMatchObject({ picked: correctIndex(0), correct: 1 });
    expect(mc([{ type: "pick", pick: wrongIndex(0) }])).toMatchObject({ picked: wrongIndex(0), correct: 0 });
  });

  test("a second pick on the same question is ignored", () => {
    const state = mc([
      { type: "pick", pick: wrongIndex(0) },
      { type: "pick", pick: correctIndex(0) },
    ]);
    expect(state).toMatchObject({ picked: wrongIndex(0), correct: 0 });
  });

  test("a pick outside the options is ignored", () => {
    expect(mc([{ type: "pick", pick: 99 }])).toEqual(initialQuizState());
    expect(mc([{ type: "pick", pick: -1 }])).toEqual(initialQuizState());
  });

  test("next before picking is ignored", () => {
    expect(mc([{ type: "next" }])).toEqual(initialQuizState());
  });

  test("next moves on with nothing picked", () => {
    expect(mc([{ type: "pick", pick: correctIndex(0) }, { type: "next" }])).toEqual({
      index: 1,
      picked: null,
      correct: 1,
      finished: false,
    });
  });

  test("next on the last question finishes with the full score", () => {
    const state = playThrough(questions.length);
    expect(state).toMatchObject({ finished: true, index: questions.length - 1, correct: questions.length });
  });

  test("counts a mix of right and wrong answers", () => {
    expect(playThrough(2).correct).toBe(2);
    expect(playThrough(0).correct).toBe(0);
  });

  test("nothing changes after finishing, except Play again", () => {
    const done = playThrough(3);
    expect(mc([{ type: "pick", pick: 0 }, { type: "next" }], done)).toEqual(done);
    expect(mc([{ type: "restart" }], done)).toEqual(initialQuizState());
  });
});

describe("quizReducer (true/false)", () => {
  const { statements } = samples.true_false;
  const tf = runner<boolean>({ count: statements.length, isRight: (i, pick) => pick === statements[i].isTrue });

  test("scores the number of statements answered correctly", () => {
    // Right on the first 4, wrong on the rest.
    const state = tf(
      statements.flatMap((s, i) => [
        { type: "pick", pick: i < 4 ? s.isTrue : !s.isTrue } as const,
        { type: "next" } as const,
      ]),
    );
    expect(state).toMatchObject({ finished: true, correct: 4 });
  });

  test("answering False to a false statement counts as right", () => {
    const falseIndex = statements.findIndex((s) => !s.isTrue);
    const start = { ...initialQuizState<boolean>(), index: falseIndex };
    expect(tf([{ type: "pick", pick: false }], start).correct).toBe(1);
  });
});

describe("quizReducer (flashcards)", () => {
  type Rating = "knew" | "learning";
  const { cards } = samples.flashcards;
  const fc = runner<Rating>({ count: cards.length, isRight: (_i, pick) => pick === "knew" });

  test("scores the cards marked 'I knew it'", () => {
    const ratings: Rating[] = cards.map((_, i) => (i % 3 === 0 ? "learning" : "knew"));
    const state = fc(ratings.flatMap((pick) => [{ type: "pick", pick } as const, { type: "next" } as const]));
    expect(state).toMatchObject({ finished: true, correct: ratings.filter((r) => r === "knew").length });
  });
});

describe("scoreText", () => {
  test("says the score in words", () => {
    expect(scoreText(7, 10)).toBe("7 out of 10");
    expect(scoreText(0, 5)).toBe("0 out of 5");
  });
});

describe("scoreMessage", () => {
  test.each([
    [10, 10, "Perfect score! Well done."],
    [9, 10, "Great work!"],
    [7, 10, "Great work!"],
    [6, 10, "Good try. Play again to improve."],
    [4, 10, "Good try. Play again to improve."],
    [3, 10, "Keep practising. You've got this."],
    [0, 10, "Keep practising. You've got this."],
    [0, 0, "Keep practising. You've got this."],
  ])("%i out of %i → %s", (correct, total, message) => {
    expect(scoreMessage(correct, total)).toBe(message);
  });
});
