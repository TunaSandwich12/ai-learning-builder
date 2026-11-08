"use client";

import { useEffect, useReducer, useRef } from "react";
import {
  initialQuizState,
  quizReducer,
  type QuizAction,
  type QuizRules,
  type QuizState,
} from "@/src/lib/player/quiz";
import type { TrueFalseActivity } from "@/src/lib/schemas";
import { Feedback } from "./feedback";
import { Progress } from "./progress";
import { BigButton, ScoreScreen } from "./score-screen";

// Student player. Every piece of AI text is placed as a plain {value} child, so
// React escapes it. Never use dangerouslySetInnerHTML here.
export function TrueFalsePlayer({ activity }: { activity: TrueFalseActivity }) {
  const { statements } = activity;
  const rules: QuizRules<boolean> = {
    count: statements.length,
    isRight: (i, pick) => pick === statements[i].isTrue,
  };
  const [state, dispatch] = useReducer(
    (s: QuizState<boolean>, a: QuizAction<boolean>) => quizReducer(rules, s, a),
    undefined,
    initialQuizState<boolean>,
  );
  const statementRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current && state.picked === null && !state.finished) statementRef.current?.focus();
    started.current = true;
  }, [state.index, state.picked, state.finished]);

  const total = statements.length;
  if (state.finished) {
    return (
      <ScoreScreen
        correct={state.correct}
        total={total}
        onPlayAgain={() => dispatch({ type: "restart" })}
      />
    );
  }

  const statement = statements[state.index];
  const picked = state.picked;
  const answered = picked !== null;
  const last = state.index === total - 1;

  return (
    <section aria-labelledby="statement" className="flex flex-col gap-5">
      <Progress label="Statement" index={state.index} total={total} done={answered} />

      <h2
        id="statement"
        ref={statementRef}
        tabIndex={-1}
        className="text-xl font-semibold break-words outline-none"
      >
        {statement.statement}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {([true, false] as const).map((value) => {
          const isPicked = picked === value;
          const isAnswer = statement.isTrue === value;
          return (
            <button
              key={String(value)}
              type="button"
              onClick={() => dispatch({ type: "pick", pick: value })}
              disabled={answered}
              aria-pressed={isPicked}
              className={
                "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-3 text-xl font-bold " +
                (answered && isAnswer
                  ? "border-green-600 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950 dark:text-green-200"
                  : answered && isPicked
                    ? "border-red-600 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950 dark:text-red-200"
                    : answered
                      ? "border-zinc-200 opacity-70 dark:border-zinc-800"
                      : "border-zinc-300 active:bg-zinc-100 dark:border-zinc-700 dark:active:bg-zinc-800")
              }
            >
              {value ? "True" : "False"}
              {answered && isPicked && (
                <span className="text-sm font-semibold">Your answer</span>
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <>
          <Feedback right={picked === statement.isTrue} explanation={statement.explanation}>
            <p>
              This statement is <strong>{statement.isTrue ? "true" : "false"}</strong>.
            </p>
          </Feedback>
          <BigButton onClick={() => dispatch({ type: "next" })} className="sm:w-auto sm:self-end sm:px-10">
            {last ? "See my score" : "Next"}
          </BigButton>
        </>
      )}
    </section>
  );
}
