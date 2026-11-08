"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { deleteActivity } from "@/app/activities/actions";
import { DELETE_MESSAGES } from "@/src/lib/save-activity";
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

type DeleteMode = "idle" | "confirm" | "deleting";

/**
 * Delete with an in-page confirm (never window.confirm). On success the server
 * action revalidates /dashboard, so the row disappears from the list.
 */
export function DeleteActivityButton({ id, title }: { id: string; title: string }) {
  const [mode, setMode] = useState<DeleteMode>("idle");
  const [error, setError] = useState<string | null>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);

  // Move focus into the confirm when it opens, and back to Delete when it closes.
  useEffect(() => {
    if (mode === "confirm") {
      opened.current = true;
      keepRef.current?.focus();
    } else if (mode === "idle" && opened.current) {
      opened.current = false;
      deleteRef.current?.focus();
    }
  }, [mode]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && mode === "confirm") setMode("idle");
  }

  async function confirmDelete() {
    setMode("deleting");
    setError(null);
    let result: Awaited<ReturnType<typeof deleteActivity>>;
    try {
      result = await deleteActivity(id);
    } catch {
      // Network failure (offline, server unreachable).
      result = { ok: false, message: DELETE_MESSAGES.failed };
    }
    if (!result.ok) {
      setError(result.message);
      setMode("idle");
    }
    // On success the refreshed list no longer has this row.
  }

  return (
    <div className="flex basis-full flex-col gap-2 sm:basis-auto" onKeyDown={handleKeyDown}>
      {mode === "idle" ? (
        <button
          ref={deleteRef}
          type="button"
          onClick={() => {
            setError(null);
            setMode("confirm");
          }}
          aria-label={`Delete ${title}`}
          className="h-11 rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-red-700 active:bg-red-50 sm:my-auto dark:border-zinc-700 dark:text-red-300 dark:active:bg-red-950"
        >
          Delete
        </button>
      ) : (
        <div
          role="group"
          aria-label={`Confirm delete ${title}`}
          className="flex flex-col gap-2 rounded-lg bg-red-50 px-3 py-3 sm:flex-row sm:items-center dark:bg-red-950"
        >
          <p className="text-sm font-medium text-red-800 dark:text-red-200">Delete this activity?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={mode === "deleting"}
              aria-busy={mode === "deleting"}
              className="h-11 flex-1 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white active:bg-red-800 disabled:opacity-60 sm:flex-none"
            >
              {mode === "deleting" ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              ref={keepRef}
              type="button"
              onClick={() => setMode("idle")}
              disabled={mode === "deleting"}
              className="h-11 flex-1 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold active:bg-zinc-100 disabled:opacity-60 sm:flex-none dark:border-zinc-700 dark:bg-zinc-900 dark:active:bg-zinc-800"
            >
              Keep
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700 break-words dark:text-red-300">
          {error}
        </p>
      )}
    </div>
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
