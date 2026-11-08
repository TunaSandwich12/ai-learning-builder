"use client";

import { useEffect, useReducer, useRef } from "react";
import {
  initialPlayState,
  isCorrectPick,
  playReducer,
  scoreMessage,
  scoreText,
  type PlayAction,
  type PlayState,
} from "@/src/lib/player/multiple-choice";
import type { MultipleChoiceActivity } from "@/src/lib/schemas";

// Student player. Every piece of AI text is placed as a plain {value} child, so
// React escapes it. Never use dangerouslySetInnerHTML here.
export function MultipleChoicePlayer({ activity }: { activity: MultipleChoiceActivity }) {
  const { questions } = activity;
  const [state, dispatch] = useReducer(
    (s: PlayState, a: PlayAction) => playReducer(questions, s, a),
    initialPlayState,
  );
  const resultRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const scoreRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  // Move focus so screen readers (and keyboard users) follow along:
  // to the result after picking, to the new question after Next, to the score at the end.
  useEffect(() => {
    if (state.finished) scoreRef.current?.focus();
    else if (state.picked !== null) resultRef.current?.focus();
    else if (started.current) questionRef.current?.focus();
    started.current = true;
  }, [state.finished, state.picked, state.index]);

  const total = questions.length;

  if (state.finished) {
    return (
      <section aria-labelledby="score" className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-base text-zinc-600 dark:text-zinc-400">Your score</p>
        <h2 id="score" ref={scoreRef} tabIndex={-1} className="text-4xl font-bold outline-none">
          {scoreText(state.correct, total)}
        </h2>
        <p className="text-lg">{scoreMessage(state.correct, total)}</p>
        <button
          type="button"
          onClick={() => dispatch({ type: "restart" })}
          className="mt-2 h-14 w-full rounded-xl bg-zinc-900 text-lg font-semibold text-white active:bg-zinc-700 sm:w-auto sm:px-10 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300"
        >
          Play again
        </button>
      </section>
    );
  }

  const question = questions[state.index];
  const picked = state.picked;
  const answered = picked !== null;
  const gotIt = answered && isCorrectPick(question, picked);
  const last = state.index === total - 1;

  return (
    <section aria-labelledby="question" className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Question {state.index + 1} of {total}
        </p>
        <div
          aria-hidden="true"
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        >
          <div
            className="h-full rounded-full bg-zinc-900 transition-[width] dark:bg-zinc-100"
            style={{ width: `${((state.index + (answered ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      <h2
        id="question"
        ref={questionRef}
        tabIndex={-1}
        className="text-xl font-semibold break-words outline-none"
      >
        {question.question}
      </h2>

      <ul className="flex flex-col gap-3">
        {question.options.map((option, oi) => {
          // Nothing about the answer is shown until the student picks.
          const isPicked = picked === oi;
          const showCorrect = answered && option.isCorrect;
          const showWrong = isPicked && !option.isCorrect;
          return (
            <li key={oi}>
              <button
                type="button"
                onClick={() => dispatch({ type: "pick", option: oi })}
                disabled={answered}
                aria-pressed={isPicked}
                className={
                  "flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left text-lg " +
                  (showCorrect
                    ? "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-950"
                    : showWrong
                      ? "border-red-600 bg-red-50 dark:border-red-500 dark:bg-red-950"
                      : answered
                        ? "border-zinc-200 opacity-70 dark:border-zinc-800"
                        : "border-zinc-300 active:bg-zinc-100 dark:border-zinc-700 dark:active:bg-zinc-800")
                }
              >
                <span className="min-w-0 break-words">{option.text}</span>
                {showCorrect && (
                  <span className="shrink-0 text-sm font-semibold text-green-800 dark:text-green-300">
                    {isPicked ? "✓ Your answer" : "Correct answer"}
                  </span>
                )}
                {showWrong && (
                  <span className="shrink-0 text-sm font-semibold text-red-800 dark:text-red-300">
                    ✗ Your answer
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div
          ref={resultRef}
          tabIndex={-1}
          aria-live="polite"
          className={
            "flex flex-col gap-2 rounded-xl p-4 outline-none " +
            (gotIt ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950")
          }
        >
          <p
            className={
              "text-lg font-bold " +
              (gotIt ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300")
            }
          >
            {gotIt ? "✓ Correct!" : "✗ Not quite."}
          </p>
          <p className="break-words">
            <span className="font-semibold">Why: </span>
            {question.explanation}
          </p>
        </div>
      )}

      {answered && (
        <button
          type="button"
          onClick={() => dispatch({ type: "next" })}
          className="h-14 w-full rounded-xl bg-zinc-900 text-lg font-semibold text-white active:bg-zinc-700 sm:w-auto sm:self-end sm:px-10 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300"
        >
          {last ? "See my score" : "Next"}
        </button>
      )}
    </section>
  );
}
