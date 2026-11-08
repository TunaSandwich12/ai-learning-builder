"use client";

import { useEffect, useReducer } from "react";
import {
  initialMatchState,
  isComplete,
  matchingScore,
  matchReducer,
  type Side,
} from "@/src/lib/player/matching";
import { derangedOrder } from "@/src/lib/player/shuffle";
import type { MatchingActivity } from "@/src/lib/schemas";
import { ClientOnly, GettingReady } from "./client-only";
import { BigButton, ScoreScreen } from "./score-screen";

const FLASH_MS = 700;

// Student player. Every piece of AI text is placed as a plain {value} child, so
// React escapes it. Never use dangerouslySetInnerHTML here.
export function MatchingPlayer({ activity }: { activity: MatchingActivity }) {
  // The right column is shuffled, so it's only rendered in the browser.
  return (
    <ClientOnly fallback={<GettingReady />}>
      <MatchingGame activity={activity} />
    </ClientOnly>
  );
}

function MatchingGame({ activity }: { activity: MatchingActivity }) {
  const { pairs } = activity;
  const n = pairs.length;
  // derangedOrder: no right item starts in the same row as its partner (for n ≥ 2).
  // This component only mounts in the browser, so the shuffle never runs on the server.
  const [state, dispatch] = useReducer(matchReducer, n, (count) =>
    initialMatchState(derangedOrder(count)),
  );

  // A wrong pair flashes briefly, then clears.
  useEffect(() => {
    if (!state.flash) return;
    const timer = setTimeout(() => dispatch({ type: "clearFlash" }), FLASH_MS);
    return () => clearTimeout(timer);
  }, [state.flash]);

  if (state.finished) {
    return (
      <ScoreScreen
        correct={matchingScore(state)}
        total={n}
        onPlayAgain={() => dispatch({ type: "restart", rightOrder: derangedOrder(n) })}
      />
    );
  }

  const complete = isComplete(state);
  const lastMatch = state.matched.at(-1);
  const announcement = state.flash
    ? "Not a match. Try again."
    : complete
      ? "All matched!"
      : lastMatch !== undefined
        ? `Matched: ${pairs[lastMatch].left} with ${pairs[lastMatch].right}.`
        : "";

  function itemButton(side: Side, pair: number, text: string) {
    const matched = state.matched.includes(pair);
    const selected = (side === "left" ? state.selectedLeft : state.selectedRight) === pair;
    const wrong = state.flash !== null && state.flash[side] === pair;
    return (
      <button
        type="button"
        onClick={() => dispatch({ type: "select", side, pair })}
        disabled={matched}
        aria-pressed={selected}
        className={
          "flex min-h-12 w-full flex-col items-start gap-1 rounded-xl border-2 px-3 py-2.5 text-left text-base " +
          (matched
            ? "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-950"
            : wrong
              ? "animate-pulse border-red-600 bg-red-50 motion-reduce:animate-none dark:border-red-500 dark:bg-red-950"
              : selected
                ? "border-zinc-900 bg-zinc-100 ring-2 ring-zinc-900/20 dark:border-zinc-100 dark:bg-zinc-800 dark:ring-zinc-100/20"
                : "border-zinc-300 active:bg-zinc-100 dark:border-zinc-700 dark:active:bg-zinc-800")
        }
      >
        <span className={"max-w-full min-w-0 break-words " + (side === "left" ? "font-medium" : "")}>
          {text}
        </span>
        {matched && (
          <span className="text-xs font-semibold text-green-800 dark:text-green-300">✓ Matched</span>
        )}
        {wrong && (
          <span className="text-xs font-semibold text-red-800 dark:text-red-300">✗ Not a match</span>
        )}
      </button>
    );
  }

  return (
    <section aria-label="Matching" className="flex flex-col gap-5">
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Tap an item on the left, then its match on the right. {state.matched.length} of {n} matched.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <ul aria-label="Left column" className="flex min-w-0 flex-col gap-2">
          {pairs.map((pair, i) => (
            <li key={i} className="min-w-0">
              {itemButton("left", i, pair.left)}
            </li>
          ))}
        </ul>
        <ul aria-label="Right column" className="flex min-w-0 flex-col gap-2">
          {state.rightOrder.map((pairIndex) => (
            <li key={pairIndex} className="min-w-0">
              {itemButton("right", pairIndex, pairs[pairIndex].right)}
            </li>
          ))}
        </ul>
      </div>

      <p aria-live="polite" className="min-h-6 text-center text-sm font-medium break-words">
        {announcement}
      </p>

      {complete && (
        <BigButton onClick={() => dispatch({ type: "finish" })} className="sm:w-auto sm:self-end sm:px-10">
          See my score
        </BigButton>
      )}
    </section>
  );
}
