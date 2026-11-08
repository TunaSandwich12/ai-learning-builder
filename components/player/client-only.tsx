"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const noSubscribe = () => () => {};

/**
 * False on the server AND during the browser's first (hydration) render, true
 * after that. Anything random (like shuffling) rendered only when this is true
 * can never differ between server and browser, so React has no hydration
 * mismatch to warn about.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
}

/** Renders `children` only in the browser after hydration; `fallback` before that. */
export function ClientOnly({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  return useIsClient() ? children : fallback;
}

/** The fallback the shuffled players show until they're in the browser. */
export function GettingReady() {
  return (
    <p role="status" className="py-8 text-center text-zinc-500 dark:text-zinc-400">
      Getting ready…
    </p>
  );
}
