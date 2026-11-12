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
    <section aria-labelledby="question" className="flex flex-col gap-6">
      <Progress label="Question" index={state.index} total={total} done={answered} />

      <h2
        id="question"
        ref={questionRef}
        tabIndex={-1}
        className="text-xl break-words outline-none sm:text-2xl"
      >
        {question.question}
      </h2>

      <ul className="flex flex-col gap-2.5">
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
                  "choice " +
                  (showCorrect ? "is-right" : showWrong ? "is-wrong" : answered ? "is-faded" : "")
                }
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-muted">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="min-w-0 break-words">{option.text}</span>
                </span>
                {showCorrect && (
                  <span className="shrink-0 text-sm font-semibold text-good-ink">
                    {isPicked ? "✓ Your answer" : "Correct answer"}
                  </span>
                )}
                {showWrong && (
                  <span className="shrink-0 text-sm font-semibold text-bad-ink">
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
          <BigButton onClick={() => dispatch({ type: "next" })} className="sm:w-auto sm:self-start">
            {last ? "See my score" : "Next"}
          </BigButton>
        </>
      )}
    </section>
  );
}
