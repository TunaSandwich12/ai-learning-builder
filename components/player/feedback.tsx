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
        "flex flex-col gap-2 rounded-2xl border p-4 outline-none sm:p-5 " +
        (right ? "border-good-line bg-good-bg" : "border-bad-line bg-bad-bg")
      }
    >
      <p
        className={
          "text-lg font-semibold " + (right ? "text-good-ink" : "text-bad-ink")
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
