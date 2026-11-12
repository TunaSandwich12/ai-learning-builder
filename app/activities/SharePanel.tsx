"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SHARE_MESSAGES } from "@/src/lib/save-activity";
import { shareActivity, stopSharing } from "./actions";

type Props = {
  /** The saved activity's id, or null if it hasn't been saved yet. */
  id: string | null;
  /** True only when saved with no unsaved changes. */
  canShare: boolean;
  /** The form is busy (creating, refining or saving). */
  disabled: boolean;
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  /** Lets the form disable its other buttons while sharing changes. */
  onBusyChange: (busy: boolean) => void;
};

type CopyState = "idle" | "copied" | "selected";

const noSubscribe = () => () => {};
const browserOrigin = () => window.location.origin;
const serverOrigin = () => "";

/** Share button, and once shared: the link, Copy link and Stop sharing. */
export function SharePanel({ id, canShare, disabled, isPublic, onChange, onBusyChange }: Props) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const linkRef = useRef<HTMLTextAreaElement>(null);
  // The site's origin. window only exists in the browser; "" while server rendering.
  const origin = useSyncExternalStore(noSubscribe, browserOrigin, serverOrigin);

  // "Copied!" fades back after a few seconds.
  useEffect(() => {
    if (copyState !== "copied") return;
    const timer = setTimeout(() => setCopyState("idle"), 3000);
    return () => clearTimeout(timer);
  }, [copyState]);

  const link = id ? `${origin}/a/${id}` : "";

  async function change(next: boolean) {
    if (!id || working) return;
    setWorking(true);
    onBusyChange(true);
    setError(null);
    setCopyState("idle");
    let result: Awaited<ReturnType<typeof shareActivity>>;
    try {
      result = await (next ? shareActivity(id) : stopSharing(id));
    } catch {
      // Network failure (offline, server unreachable).
      result = { ok: false, message: SHARE_MESSAGES.failed };
    }
    if (result.ok) onChange(next);
    else setError(result.message);
    setWorking(false);
    onBusyChange(false);
  }

  function selectLink() {
    const field = linkRef.current;
    if (!field) return;
    field.focus();
    field.select();
    field.setSelectionRange(0, field.value.length); // iOS ignores select()
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopyState("copied");
    } catch {
      // No clipboard (older phones, or not HTTPS): select it so they can copy.
      selectLink();
      setCopyState("selected");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!isPublic ? (
        <button
          type="button"
          onClick={() => change(true)}
          disabled={!canShare || disabled || working}
          aria-busy={working}
          className="btn btn-secondary self-start"
        >
          {working ? "Sharing…" : canShare ? "Share with students" : "Save first to share"}
        </button>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-good-line bg-good-bg p-4 sm:p-5">
          <p className="font-semibold text-good-ink">
            Shared. Anyone with this link can play it.
          </p>
          <label htmlFor="share-link" className="text-sm font-semibold">
            Link for your students
          </label>
          {/* A textarea, not an input, so a long link wraps instead of scrolling sideways. */}
          <textarea
            id="share-link"
            ref={linkRef}
            readOnly
            rows={2}
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="field resize-none font-mono text-sm break-all"
          />
          <p className="text-sm text-muted">
            Students see the last saved version.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLink}
              disabled={!origin}
              className="btn btn-primary"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={() => change(false)}
              disabled={disabled || working}
              aria-busy={working}
              className="btn btn-secondary"
            >
              {working ? "Stopping…" : "Stop sharing"}
            </button>
          </div>
          <p aria-live="polite" className="text-sm font-semibold">
            {copyState === "copied"
              ? "Copied!"
              : copyState === "selected"
                ? "Link selected. Press and hold (or Ctrl+C) to copy."
                : ""}
          </p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="alert alert-bad"
        >
          {error}
        </p>
      )}
    </div>
  );
}
