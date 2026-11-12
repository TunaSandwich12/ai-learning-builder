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
    <section aria-labelledby="score" className="flex flex-col items-center gap-3 py-6 text-center">
      <p className="font-medium text-muted">Your score</p>
      <h2 id="score" ref={headingRef} tabIndex={-1} className="text-5xl font-bold text-tint-ink outline-none sm:text-6xl">
        {scoreText(correct, total)}
      </h2>
      <p className="text-lg">{scoreMessage(correct, total)}</p>
      <BigButton onClick={onPlayAgain} className="mt-4 sm:w-auto">
        Play again
      </BigButton>
    </section>
  );
}

/** The large primary button used for Next / See my score / Play again (56px tall). */
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
        "btn btn-primary btn-lg w-full " +
        className
      }
    >
      {children}
    </button>
  );
}
