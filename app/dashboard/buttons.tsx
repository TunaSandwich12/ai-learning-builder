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
        className="btn btn-secondary"
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
    <div className="flex flex-col gap-2" onKeyDown={handleKeyDown}>
      {mode === "idle" ? (
        <button
          ref={deleteRef}
          type="button"
          onClick={() => {
            setError(null);
            setMode("confirm");
          }}
          aria-label={`Delete ${title}`}
          className="btn btn-secondary self-start text-bad-ink"
        >
          Delete
        </button>
      ) : (
        <div
          role="group"
          aria-label={`Confirm delete ${title}`}
          className="flex flex-col gap-3 rounded-2xl border border-bad-line bg-bad-bg p-4"
        >
          <p className="text-sm font-semibold text-bad-ink">Delete this activity? This can&apos;t be undone.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={mode === "deleting"}
              aria-busy={mode === "deleting"}
              className="btn btn-danger flex-1 sm:flex-none"
            >
              {mode === "deleting" ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              ref={keepRef}
              type="button"
              onClick={() => setMode("idle")}
              disabled={mode === "deleting"}
              className="btn btn-secondary flex-1 sm:flex-none"
            >
              Keep
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm font-semibold break-words text-bad-ink">
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
