// Game logic for the multiple choice player. Plain functions (no React) so the
// rules and scoring can be unit tested.
import type { MultipleChoiceActivity } from "@/src/lib/schemas";

type Question = MultipleChoiceActivity["questions"][number];

export type PlayState = {
  /** The question on screen (0-based). */
  index: number;
  /** The option the student picked for this question, or null before picking. */
  picked: number | null;
  /** How many questions were answered correctly so far. */
  correct: number;
  /** True once the last question's Next has been pressed. */
  finished: boolean;
};

export type PlayAction =
  | { type: "pick"; option: number }
  | { type: "next" }
  | { type: "restart" };

export const initialPlayState: PlayState = { index: 0, picked: null, correct: 0, finished: false };

export function isCorrectPick(question: Question, option: number): boolean {
  return question.options[option]?.isCorrect === true;
}

export function playReducer(questions: Question[], state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "pick": {
      const question = questions[state.index];
      // One answer per question; ignore taps after picking or on missing options.
      if (state.finished || state.picked !== null || !question) return state;
      if (action.option < 0 || action.option >= question.options.length) return state;
      return {
        ...state,
        picked: action.option,
        correct: state.correct + (isCorrectPick(question, action.option) ? 1 : 0),
      };
    }
    case "next": {
      // Must pick before moving on.
      if (state.finished || state.picked === null) return state;
      const last = state.index >= questions.length - 1;
      return last
        ? { ...state, finished: true }
        : { ...state, index: state.index + 1, picked: null };
    }
    case "restart":
      return initialPlayState;
  }
}

/** "7 out of 10" */
export function scoreText(correct: number, total: number): string {
  return `${correct} out of ${total}`;
}

/** A short, encouraging message for the end screen. */
export function scoreMessage(correct: number, total: number): string {
  const ratio = total > 0 ? correct / total : 0;
  if (total > 0 && correct === total) return "Perfect score! Well done.";
  if (ratio >= 0.7) return "Great work!";
  if (ratio >= 0.4) return "Good try. Play again to improve.";
  return "Keep practising. You've got this.";
}
