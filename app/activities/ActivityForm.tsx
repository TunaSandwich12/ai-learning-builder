"use client";

import { useRef, useState, type FormEvent } from "react";
import { MultipleChoicePreview } from "@/components/preview/multiple-choice";
import { activityTypeInfo, activityTypeOptions } from "@/src/lib/activity-types";
import { FALLBACK_ERROR, readGenerateResponse } from "@/src/lib/generate-client";
import { SAVE_MESSAGES } from "@/src/lib/save-activity";
import type { Activity, ActivityType } from "@/src/lib/schemas";
import { MAX_REQUEST_LENGTH } from "@/src/lib/schemas/generate-request";
import { saveActivity } from "./actions";
import { RefineChat } from "./RefineChat";

type SaveState = "idle" | "saving" | "saved" | "unsaved";

const SAVE_STATUS_TEXT: Record<SaveState, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  unsaved: "Unsaved changes",
};

type Props = {
  /** A saved activity to start from (the /activities/<id> page). */
  initial?: { id: string; activity: Activity };
};

/** Create, refine and save an activity. Used by /activities/new and /activities/<id>. */
export function ActivityForm({ initial }: Props) {
  const [type, setType] = useState<ActivityType | null>(initial?.activity.type ?? null);
  const [request, setRequest] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<Activity | null>(initial?.activity ?? null);
  const [refining, setRefining] = useState(false);
  // A new key gives each new activity a fresh, empty chat.
  const [chatKey, setChatKey] = useState(0);
  // Saving: null id means "not saved yet" (the next save inserts a new row).
  const [savedId, setSavedId] = useState<string | null>(initial?.id ?? null);
  const [saveState, setSaveState] = useState<SaveState>(initial ? "saved" : "idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  // Goes up on every change to the activity, so a save that finishes after a
  // refine doesn't wrongly report "Saved".
  const version = useRef(0);
  const saving = saveState === "saving";
  const busy = creating || refining || saving;

  /** Forget the saved row: the next activity is a new one. */
  function resetSave() {
    version.current++;
    setSavedId(null);
    setSaveState("idle");
    setSaveError(null);
    if (window.location.pathname !== "/activities/new") {
      window.history.replaceState(null, "", "/activities/new");
    }
  }

  function chooseType(next: ActivityType) {
    if (busy) return;
    setType(next);
    setActivity(null);
    setChatKey((k) => k + 1);
    setError(null);
    resetSave();
  }

  function handleRefined(next: Activity) {
    version.current++;
    setActivity(next);
    // Functional update: this runs after an await in RefineChat, so a closed-over
    // savedId could be stale. "idle" means never saved, so nothing is "unsaved".
    setSaveState((s) => (s === "idle" ? "idle" : "unsaved"));
  }

  async function handleSave() {
    if (!activity || busy) return;
    const sentVersion = version.current;
    setSaveState("saving");
    setSaveError(null);

    let result: Awaited<ReturnType<typeof saveActivity>>;
    try {
      result = await saveActivity(savedId, activity);
    } catch {
      // Network failure (offline, server unreachable).
      result = { ok: false, message: SAVE_MESSAGES.failed };
    }

    if (!result.ok) {
      setSaveError(result.message);
      setSaveState(savedId ? "unsaved" : "idle");
      return;
    }
    if (!savedId) {
      // Update the address bar without reloading or losing what's on screen.
      window.history.replaceState(null, "", `/activities/${result.id}`);
    }
    setSavedId(result.id);
    setSaveState(version.current === sentVersion ? "saved" : "unsaved");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!type || busy || !request.trim()) return;

    setCreating(true);
    setError(null);
    setActivity(null);
    setChatKey((k) => k + 1);
    resetSave();
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, request }),
      });
      const result = await readGenerateResponse(res);
      if (result.ok) setActivity(result.activity);
      else setError(result.message);
    } catch {
      // Network failure (offline, server unreachable).
      setError(FALLBACK_ERROR);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-3 text-base font-semibold">What kind of activity?</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {activityTypeOptions.map((option) => {
            const selected = option.type === type;
            return (
              <button
                key={option.type}
                type="button"
                aria-pressed={selected}
                disabled={busy}
                onClick={() => chooseType(option.type)}
                className={
                  "min-h-16 rounded-lg border-2 px-4 py-3 text-left disabled:opacity-60 " +
                  (selected
                    ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800"
                    : "border-zinc-200 active:bg-zinc-100 dark:border-zinc-800 dark:active:bg-zinc-800")
                }
              >
                <span className="block text-base font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-400">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {type && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="request" className="text-base font-semibold">
            Describe your activity, or paste your notes
          </label>
          <textarea
            id="request"
            name="request"
            rows={8}
            maxLength={MAX_REQUEST_LENGTH}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder={activityTypeInfo[type].placeholder}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-300 dark:focus:ring-zinc-300/20"
          />

          <button
            type="submit"
            disabled={busy || !request.trim()}
            aria-busy={creating}
            className="h-12 w-full rounded-lg bg-zinc-900 text-base font-semibold text-white active:bg-zinc-700 disabled:opacity-60 sm:w-auto sm:self-start sm:px-6 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300"
          >
            {creating ? "Creating your activity…" : "Create activity"}
          </button>

          <div aria-live="polite" className="sr-only">
            {creating ? "Creating your activity…" : ""}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 break-words dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          )}
        </form>
      )}

      {activity && type && (
        <div className="flex flex-col gap-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          {activity.type === "multiple_choice" ? (
            <MultipleChoicePreview activity={activity} />
          ) : (
            <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Preview coming on Day 4
            </p>
          )}
          <RefineChat
            key={chatKey}
            type={type}
            activity={activity}
            onUpdated={handleRefined}
            onBusyChange={setRefining}
          />

          <div className="flex flex-col gap-2 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:gap-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy || saveState === "saved"}
              aria-busy={saving}
              className="h-12 w-full rounded-lg bg-zinc-900 text-base font-semibold text-white active:bg-zinc-700 disabled:opacity-60 sm:w-auto sm:px-6 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <p
              aria-live="polite"
              className={
                "text-sm " +
                (saveState === "unsaved"
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-zinc-600 dark:text-zinc-400")
              }
            >
              {SAVE_STATUS_TEXT[saveState]}
            </p>
          </div>

          {saveError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 break-words dark:bg-red-950 dark:text-red-300"
            >
              {saveError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
