import { describe, expect, test } from "vitest";
import { samples } from "@/src/lib/samples";
import {
  initialPlayState,
  playReducer,
  scoreMessage,
  scoreText,
  type PlayAction,
  type PlayState,
} from "./multiple-choice";

const { questions } = samples.multiple_choice;
const correctIndex = (qi: number) => questions[qi].options.findIndex((o) => o.isCorrect);
const wrongIndex = (qi: number) => questions[qi].options.findIndex((o) => !o.isCorrect);

const run = (actions: PlayAction[], from: PlayState = initialPlayState) =>
  actions.reduce((s, a) => playReducer(questions, s, a), from);

/** Answers every question: right for the first `rightCount`, wrong after. */
function playThrough(rightCount: number): PlayState {
  const actions: PlayAction[] = questions.flatMap((_, qi) => [
    { type: "pick", option: qi < rightCount ? correctIndex(qi) : wrongIndex(qi) } as const,
    { type: "next" } as const,
  ]);
  return run(actions);
}

describe("playReducer", () => {
  test("a right pick adds to the score; a wrong one doesn't", () => {
    expect(run([{ type: "pick", option: correctIndex(0) }])).toMatchObject({
      picked: correctIndex(0),
      correct: 1,
    });
    expect(run([{ type: "pick", option: wrongIndex(0) }])).toMatchObject({
      picked: wrongIndex(0),
      correct: 0,
    });
  });

  test("a second pick on the same question is ignored", () => {
    const state = run([
      { type: "pick", option: wrongIndex(0) },
      { type: "pick", option: correctIndex(0) },
    ]);
    expect(state).toMatchObject({ picked: wrongIndex(0), correct: 0 });
  });

  test("a pick outside the options is ignored", () => {
    expect(run([{ type: "pick", option: 99 }])).toEqual(initialPlayState);
    expect(run([{ type: "pick", option: -1 }])).toEqual(initialPlayState);
  });

  test("next before picking is ignored", () => {
    expect(run([{ type: "next" }])).toEqual(initialPlayState);
  });

  test("next moves to the next question with nothing picked", () => {
    const state = run([{ type: "pick", option: correctIndex(0) }, { type: "next" }]);
    expect(state).toEqual({ index: 1, picked: null, correct: 1, finished: false });
  });

  test("next on the last question finishes with the full score", () => {
    const state = playThrough(questions.length);
    expect(state.finished).toBe(true);
    expect(state.index).toBe(questions.length - 1);
    expect(state.correct).toBe(questions.length);
  });

  test("counts a mix of right and wrong answers", () => {
    expect(playThrough(2).correct).toBe(2);
    expect(playThrough(0).correct).toBe(0);
  });

  test("nothing changes after finishing, except Play again", () => {
    const done = playThrough(3);
    expect(run([{ type: "pick", option: 0 }, { type: "next" }], done)).toEqual(done);
    expect(run([{ type: "restart" }], done)).toEqual(initialPlayState);
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
