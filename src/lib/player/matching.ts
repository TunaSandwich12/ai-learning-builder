// Game logic for the matching player. Plain functions (no React) so the rules
// and scoring can be unit tested.
//
// Pair i is (left[i], right[i]). Items on both sides are identified by their pair
// number, so a left item and a right item match when they have the same number.
// `rightOrder` is only the display order of the right column.

export type Side = "left" | "right";

export type MatchState = {
  /** Display order of the right column: rightOrder[row] = pair number. */
  rightOrder: number[];
  selectedLeft: number | null;
  selectedRight: number | null;
  /** Pair numbers already matched (locked). */
  matched: number[];
  /** Left items that had at least one wrong try. */
  missed: number[];
  /** A wrong pair being flashed; taps are ignored until it clears. */
  flash: { left: number; right: number } | null;
  /** True once the student has pressed "See my score". */
  finished: boolean;
};

export type MatchAction =
  | { type: "select"; side: Side; pair: number }
  | { type: "clearFlash" }
  | { type: "finish" }
  | { type: "restart"; rightOrder: number[] };

export function initialMatchState(rightOrder: number[]): MatchState {
  return {
    rightOrder,
    selectedLeft: null,
    selectedRight: null,
    matched: [],
    missed: [],
    flash: null,
    finished: false,
  };
}

export const isComplete = (state: MatchState) => state.matched.length === state.rightOrder.length;

export function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case "select": {
      const n = state.rightOrder.length;
      const { side, pair } = action;
      if (state.finished || state.flash) return state;
      if (pair < 0 || pair >= n || state.matched.includes(pair)) return state;

      const key = side === "left" ? "selectedLeft" : "selectedRight";
      // Tapping the selected item again deselects it.
      if (state[key] === pair) return { ...state, [key]: null };

      const next = { ...state, [key]: pair };
      if (next.selectedLeft === null || next.selectedRight === null) return next;

      // One from each side: check the pair.
      const left = next.selectedLeft;
      const right = next.selectedRight;
      const cleared = { ...next, selectedLeft: null, selectedRight: null };
      if (left === right) return { ...cleared, matched: [...state.matched, left] };
      return {
        ...cleared,
        flash: { left, right },
        missed: state.missed.includes(left) ? state.missed : [...state.missed, left],
      };
    }
    case "clearFlash":
      return state.flash ? { ...state, flash: null } : state;
    case "finish":
      return isComplete(state) ? { ...state, finished: true } : state;
    case "restart":
      return initialMatchState(action.rightOrder);
  }
}

/** Score = pairs matched on the first try (no wrong try for that left item). */
export function matchingScore(state: MatchState): number {
  return state.matched.filter((pair) => !state.missed.includes(pair)).length;
}
