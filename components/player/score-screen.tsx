"use client";

import { useEffect, useRef } from "react";
import { scoreMessage, scoreText } from "@/src/lib/player/score";

/** The end screen every player shows: "7 out of 10", a message, and Play again. */
export function ScoreScreen({
  correct,
  total,
  onPlayAgain,
}: {
  correct: number;
  total: number;
  onPlayAgain: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the score so screen readers announce it.
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <section aria-labelledby="score" className="flex flex-col items-center gap-4 py-8 text-center">
      <p className="text-base text-zinc-600 dark:text-zinc-400">Your score</p>
      <h2 id="score" ref={headingRef} tabIndex={-1} className="text-4xl font-bold outline-none">
        {scoreText(correct, total)}
      </h2>
      <p className="text-lg">{scoreMessage(correct, total)}</p>
      <BigButton onClick={onPlayAgain} className="mt-2 sm:w-auto sm:px-10">
        Play again
      </BigButton>
    </section>
  );
}

/** The large dark button used for Next / See my score / Play again (56px tall). */
export function BigButton({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "h-14 w-full rounded-xl bg-zinc-900 px-6 text-lg font-semibold text-white active:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300 " +
        className
      }
    >
      {children}
    </button>
  );
}
