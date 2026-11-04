"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { addTestActivity, signOut, type AddActivityState } from "./actions";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <PendingButton
        pendingText="Logging out…"
        className="h-11 rounded-lg border border-zinc-300 px-4 text-sm font-semibold active:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:active:bg-zinc-800"
      >
        Log out
      </PendingButton>
    </form>
  );
}

const initialAddState: AddActivityState = {};

// TEMP: remove along with addTestActivity.
export function AddTestActivityButton() {
  const [state, formAction] = useActionState(addTestActivity, initialAddState);
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <PendingButton
        pendingText="Adding…"
        className="h-12 w-full rounded-lg bg-zinc-900 text-base font-semibold text-white active:bg-zinc-700 disabled:opacity-60 sm:w-auto sm:px-6 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300"
      >
        Add test activity
      </PendingButton>
      <div aria-live="polite">
        {state.error && <p className="text-sm text-red-700 dark:text-red-300">{state.error}</p>}
      </div>
    </form>
  );
}

function PendingButton({
  children,
  pendingText,
  className,
}: {
  children: ReactNode;
  pendingText: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
