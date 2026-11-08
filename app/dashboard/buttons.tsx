"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { signOut } from "./actions";

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
