"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import {
  initialQuizState,
  quizReducer,
  type QuizAction,
  type QuizRules,
  type QuizState,
} from "@/src/lib/player/quiz";
import type { FlashcardsActivity } from "@/src/lib/schemas";
import { Progress } from "./progress";
import { ScoreScreen } from "./score-screen";

type Rating = "knew" | "learning";

// Student player. Every piece of AI text is placed as a plain {value} child, so
// React escapes it. Never use dangerouslySetInnerHTML here.
export function FlashcardsPlayer({ activity }: { activity: FlashcardsActivity }) {
  const { cards } = activity;
  const rules: QuizRules<Rating> = { count: cards.length, isRight: (_i, pick) => pick === "knew" };
  const [state, dispatch] = useReducer(
    (s: QuizState<Rating>, a: QuizAction<Rating>) => quizReducer(rules, s, a),
    undefined,
    initialQuizState<Rating>,
  );
  // Which side is showing, and whether this card has been flipped at least once.
  const [showBack, setShowBack] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const started = useRef(false);

  // After rating a card, move focus to the next card.
  useEffect(() => {
    if (started.current && !state.finished) cardRef.current?.focus();
    started.current = true;
  }, [state.index, state.finished]);

  const total = cards.length;
  if (state.finished) {
    return (
      <ScoreScreen
        correct={state.correct}
        total={total}
        onPlayAgain={() => {
          setShowBack(false);
          setFlipped(false);
          dispatch({ type: "restart" });
        }}
      />
    );
  }

  const card = cards[state.index];

  function flip() {
    setShowBack((b) => !b);
    setFlipped(true);
  }

  function rate(pick: Rating) {
    dispatch({ type: "pick", pick });
    dispatch({ type: "next" });
    setShowBack(false);
    setFlipped(false);
  }

  return (
    <section aria-label="Flashcards" className="flex flex-col gap-5">
      <Progress label="Card" index={state.index} total={total} done={false} />

      {/* The whole card is one big button. Only the visible side is on the page,
          so screen readers don't read the back early. */}
      <button
        ref={cardRef}
        type="button"
        onClick={flip}
        className={
          "flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 px-5 py-6 text-center shadow-sm active:scale-[0.99] motion-reduce:active:scale-100 " +
          (showBack
            ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
            : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950")
        }
      >
        <span className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          {showBack ? "Back" : "Front"}
        </span>
        <span
          className={
            "max-w-full min-w-0 break-words " + (showBack ? "text-xl" : "text-2xl font-bold")
          }
        >
          {showBack ? card.back : card.front}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {showBack ? "Tap to see the front" : "Tap to flip"}
        </span>
      </button>

      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => rate("knew")}
            className="min-h-14 rounded-xl border-2 border-green-600 bg-green-50 px-3 py-3 text-lg font-semibold text-green-900 active:bg-green-100 dark:border-green-500 dark:bg-green-950 dark:text-green-200 dark:active:bg-green-900"
          >
            I knew it
          </button>
          <button
            type="button"
            onClick={() => rate("learning")}
            className="min-h-14 rounded-xl border-2 border-zinc-300 px-3 py-3 text-lg font-semibold active:bg-zinc-100 dark:border-zinc-700 dark:active:bg-zinc-800"
          >
            Still learning
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Flip the card to check your answer.
        </p>
      )}
    </section>
  );
}
