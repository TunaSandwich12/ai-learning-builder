import { describe, expect, test } from "vitest";
import {
  initialMatchState,
  isComplete,
  matchingScore,
  matchReducer,
  type MatchAction,
  type MatchState,
} from "./matching";

const ORDER = [2, 0, 3, 1]; // 4 pairs; right column display order
const run = (actions: MatchAction[], from: MatchState = initialMatchState(ORDER)) =>
  actions.reduce(matchReducer, from);
const left = (pair: number): MatchAction => ({ type: "select", side: "left", pair });
const right = (pair: number): MatchAction => ({ type: "select", side: "right", pair });

describe("matchReducer", () => {
  test("selecting one side just selects it", () => {
    expect(run([left(1)])).toMatchObject({ selectedLeft: 1, selectedRight: null, matched: [] });
  });

  test("a correct pair locks both and clears the selection", () => {
    expect(run([left(1), right(1)])).toMatchObject({
      matched: [1],
      selectedLeft: null,
      selectedRight: null,
      flash: null,
      missed: [],
    });
  });

  test("right first, then left, works the same", () => {
    expect(run([right(2), left(2)]).matched).toEqual([2]);
  });

  test("a wrong pair flashes, records the miss on the left item, and clears", () => {
    expect(run([left(0), right(3)])).toMatchObject({
      matched: [],
      flash: { left: 0, right: 3 },
      missed: [0],
      selectedLeft: null,
      selectedRight: null,
    });
  });

  test("taps are ignored while the wrong pair is flashing", () => {
    const flashing = run([left(0), right(3)]);
    expect(run([left(1)], flashing)).toEqual(flashing);
    expect(run([{ type: "clearFlash" }, left(1)], flashing).selectedLeft).toBe(1);
  });

  test("tapping the selected item again deselects it", () => {
    expect(run([left(1), left(1)]).selectedLeft).toBeNull();
  });

  test("tapping another item on the same side switches the selection", () => {
    expect(run([left(1), left(2)]).selectedLeft).toBe(2);
  });

  test("matched items can't be selected again", () => {
    const state = run([left(1), right(1)]);
    expect(run([left(1)], state)).toEqual(state);
    expect(run([right(1)], state)).toEqual(state);
  });

  test("out-of-range taps are ignored", () => {
    expect(run([left(9)])).toEqual(initialMatchState(ORDER));
    expect(run([right(-1)])).toEqual(initialMatchState(ORDER));
  });

  test("a second wrong try on the same left item counts as one miss", () => {
    const state = run([left(0), right(3), { type: "clearFlash" }, left(0), right(2)]);
    expect(state.missed).toEqual([0]);
  });

  test("finish only works once every pair is matched", () => {
    expect(run([left(0), right(0), { type: "finish" }]).finished).toBe(false);
    const done = run([0, 1, 2, 3].flatMap((p) => [left(p), right(p)]));
    expect(isComplete(done)).toBe(true);
    expect(run([{ type: "finish" }], done).finished).toBe(true);
  });

  test("restart starts over with the new right column order", () => {
    const done = run([0, 1, 2, 3].flatMap((p) => [left(p), right(p)]).concat({ type: "finish" }));
    expect(run([{ type: "restart", rightOrder: [1, 3, 0, 2] }], done)).toEqual(
      initialMatchState([1, 3, 0, 2]),
    );
  });
});

describe("matchingScore", () => {
  test("all matched first try → full score", () => {
    expect(matchingScore(run([0, 1, 2, 3].flatMap((p) => [left(p), right(p)])))).toBe(4);
  });

  test("pairs with a wrong try first don't count", () => {
    const state = run([
      left(0), right(1), { type: "clearFlash" }, // pair 0 missed
      left(2), right(3), { type: "clearFlash" }, // pair 2 missed
      left(0), right(0),
      left(1), right(1),
      left(2), right(2),
      left(3), right(3),
    ]);
    expect(isComplete(state)).toBe(true);
    expect(matchingScore(state)).toBe(2);
  });

  test("a wrong right item doesn't count against that right item's own pair", () => {
    // left 0 tried with right 1: only pair 0 is missed, pair 1 can still score.
    const state = run([left(0), right(1), { type: "clearFlash" }, left(1), right(1), left(0), right(0)]);
    expect(state.missed).toEqual([0]);
    expect(matchingScore(state)).toBe(1);
  });
});
