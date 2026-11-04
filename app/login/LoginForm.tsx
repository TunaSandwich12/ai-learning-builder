"use client";

import { useActionState } from "react";
import type { AuthState } from "@/src/lib/auth/schema";
import { authenticate } from "./actions";

const initialState: AuthState = {};

const inputClass =
  "h-12 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 " +
  "placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-300 dark:focus:ring-zinc-300/20";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          defaultValue={state.email}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          maxLength={72}
          required
          aria-describedby="password-hint"
          className={inputClass}
        />
        <p id="password-hint" className="text-sm text-zinc-500 dark:text-zinc-400">
          At least 8 characters.
        </p>
      </div>

      <div aria-live="polite" className="min-h-6 text-sm">
        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950 dark:text-red-300">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-green-800 dark:bg-green-950 dark:text-green-300">
            {state.message}
          </p>
        )}
      </div>

      {/* Pressing Enter uses the first button: Log in. */}
      <button
        type="submit"
        name="intent"
        value="login"
        disabled={pending}
        className="h-12 w-full rounded-lg bg-zinc-900 text-base font-semibold text-white active:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300"
      >
        {pending ? "Please wait…" : "Log in"}
      </button>
      <button
        type="submit"
        name="intent"
        value="signup"
        disabled={pending}
        className="h-12 w-full rounded-lg border border-zinc-300 text-base font-semibold active:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:active:bg-zinc-800"
      >
        Create account
      </button>
    </form>
  );
}
