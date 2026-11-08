"use client";

import { useEffect, useReducer, useRef } from "react";
import {
  initialQuizState,
  quizReducer,
  type QuizAction,
  type QuizRules,
  type QuizState,
} from "@/src/lib/player/quiz";
import type { MultipleChoiceActivity } from "@/src/lib/schemas";
import { Feedback } from "./feedback";
import { Progress } from "./progress";
import { BigButton, ScoreScreen } from "./score-screen";

// Student player. Every piece of AI text is placed as a plain {value} child, so
// React escapes it. Never use dangerouslySetInnerHTML here.
export function MultipleChoicePlayer({ activity }: { activity: MultipleChoiceActivity }) {
  const { questions } = activity;
  const rules: QuizRules<number> = {
    count: questions.length,
    isRight: (i, option) => questions[i].options[option]?.isCorrect === true,
    isValid: (i, option) => option >= 0 && option < questions[i].options.length,
  };
  const [state, dispatch] = useReducer(
    (s: QuizState<number>, a: QuizAction<number>) => quizReducer(rules, s, a),
    undefined,
    initialQuizState<number>,
  );
  const questionRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  // After Next, move focus to the new question so screen readers follow along.
  useEffect(() => {
    if (started.current && state.picked === null && !state.finished) questionRef.current?.focus();
    started.current = true;
  }, [state.index, state.picked, state.finished]);

  const total = questions.length;
  if (state.finished) {
    return (
      <ScoreScreen
        correct={state.correct}
        total={total}
        onPlayAgain={() => dispatch({ type: "restart" })}
      />
    );
  }

  const question = questions[state.index];
  const picked = state.picked;
  const answered = picked !== null;
  const last = state.index === total - 1;

  return (
    <section aria-labelledby="question" className="flex flex-col gap-5">
      <Progress label="Question" index={state.index} total={total} done={answered} />

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
                onClick={() => dispatch({ type: "pick", pick: oi })}
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
        <>
          <Feedback right={rules.isRight(state.index, picked)} explanation={question.explanation} />
          <BigButton onClick={() => dispatch({ type: "next" })} className="sm:w-auto sm:self-end sm:px-10">
            {last ? "See my score" : "Next"}
          </BigButton>
        </>
      )}
    </section>
  );
}
