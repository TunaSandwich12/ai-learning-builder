"use client";

import { useActionState } from "react";
import type { AuthState } from "@/src/lib/auth/schema";
import { authenticate } from "./actions";

const initialState: AuthState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold">
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
          className="field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold">
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
          className="field"
        />
        <p id="password-hint" className="text-sm text-muted">
          At least 8 characters.
        </p>
      </div>

      <div aria-live="polite">
        {state.error && (
          <p className="alert alert-bad">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="alert alert-good">
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
        className="btn btn-primary btn-lg w-full"
      >
        {pending ? "Please wait…" : "Log in"}
      </button>
      <p className="border-t border-rule pt-5 text-center text-sm text-muted">New here? Use the same email and password.</p>
      <button
        type="submit"
        name="intent"
        value="signup"
        disabled={pending}
        className="btn btn-secondary btn-lg w-full"
      >
        Create account
      </button>
    </form>
  );
}
