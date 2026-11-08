// Step-by-step game logic shared by the multiple choice, true/false and
// flashcards players: answer one item, see the result, press Next.
// Plain functions (no React) so the rules and scoring can be unit tested.

export type QuizState<P> = {
  /** The item on screen (0-based). */
  index: number;
  /** The answer given for this item, or null before answering. */
  picked: P | null;
  /** How many items were answered "right" so far. */
  correct: number;
  /** True once Next has been pressed on the last item. */
  finished: boolean;
};

export type QuizAction<P> = { type: "pick"; pick: P } | { type: "next" } | { type: "restart" };

export type QuizRules<P> = {
  /** How many items there are. */
  count: number;
  /** Whether this answer to item `index` counts towards the score. */
  isRight: (index: number, pick: P) => boolean;
  /** Optional: reject answers that don't exist (e.g. an option number out of range). */
  isValid?: (index: number, pick: P) => boolean;
};

export function initialQuizState<P>(): QuizState<P> {
  return { index: 0, picked: null, correct: 0, finished: false };
}

export function quizReducer<P>(
  rules: QuizRules<P>,
  state: QuizState<P>,
  action: QuizAction<P>,
): QuizState<P> {
  switch (action.type) {
    case "pick": {
      // One answer per item; ignore taps after answering or after the end.
      if (state.finished || state.picked !== null || state.index >= rules.count) return state;
      if (rules.isValid && !rules.isValid(state.index, action.pick)) return state;
      return {
        ...state,
        picked: action.pick,
        correct: state.correct + (rules.isRight(state.index, action.pick) ? 1 : 0),
      };
    }
    case "next": {
      // Must answer before moving on.
      if (state.finished || state.picked === null) return state;
      const last = state.index >= rules.count - 1;
      return last
        ? { ...state, finished: true }
        : { ...state, index: state.index + 1, picked: null };
    }
    case "restart":
      return initialQuizState<P>();
  }
}
