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
          "choice min-h-12 flex-col items-start justify-center gap-1 px-3 py-2.5 text-base " +
          (matched
            ? "is-right"
            : wrong
              ? "is-wrong animate-pulse motion-reduce:animate-none"
              : selected
                ? ""
                : "")
        }
      >
        <span className={"max-w-full min-w-0 break-words " + (side === "left" ? "font-semibold" : "")}>
          {text}
        </span>
        {matched && (
          <span className="text-xs font-semibold text-good-ink">✓ Matched</span>
        )}
        {wrong && (
          <span className="text-xs font-semibold text-bad-ink">✗ Not a match</span>
        )}
      </button>
    );
  }

  return (
    <section aria-label="Matching" className="flex flex-col gap-5">
      <p className="text-sm font-medium text-muted">
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

      <p aria-live="polite" className="min-h-6 text-sm font-semibold break-words">
        {announcement}
      </p>

      {complete && (
        <BigButton onClick={() => dispatch({ type: "finish" })} className="sm:w-auto sm:self-start">
          See my score
        </BigButton>
      )}
    </section>
  );
}
