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
          "flex min-h-60 w-full flex-col items-center justify-center gap-4 rounded-3xl border-[1.5px] px-6 py-8 text-center transition-colors " +
          (showBack ? "border-primary bg-tint" : "border-line bg-surface hover:border-primary")
        }
      >
        <span className="tag">{showBack ? "Back" : "Front"}</span>
        <span
          className={
            "max-w-full min-w-0 break-words " +
            (showBack ? "text-xl" : "text-2xl font-semibold sm:text-3xl")
          }
        >
          {showBack ? card.back : card.front}
        </span>
        <span className="text-sm text-muted">
          {showBack ? "Tap to see the front" : "Tap to flip"}
        </span>
      </button>

      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => rate("knew")}
            className="btn btn-lg border-good-line bg-good-bg px-3 text-good-ink"
          >
            I knew it
          </button>
          <button
            type="button"
            onClick={() => rate("learning")}
            className="btn btn-secondary btn-lg px-3"
          >
            Still learning
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-muted">
          Flip the card to check your answer.
        </p>
      )}
    </section>
  );
}
