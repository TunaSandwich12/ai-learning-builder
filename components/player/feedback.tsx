"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * "✓ Correct!" / "✗ Not quite." in words, plus the explanation. Takes focus when
 * it appears so screen readers announce the result. AI text is plain {value}.
 */
export function Feedback({
  right,
  explanation,
  children,
}: {
  right: boolean;
  explanation: string;
  /** Optional extra line between the result and the explanation. */
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-live="polite"
      className={
        "flex flex-col gap-2 rounded-xl p-4 outline-none " +
        (right ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950")
      }
    >
      <p
        className={
          "text-lg font-bold " +
          (right ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300")
        }
      >
        {right ? "✓ Correct!" : "✗ Not quite."}
      </p>
      {children}
      <p className="break-words">
        <span className="font-semibold">Why: </span>
        {explanation}
      </p>
    </div>
  );
}
