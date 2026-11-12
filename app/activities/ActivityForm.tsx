"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { ActivityPreview } from "@/components/preview";
import { activityTypeInfo, activityTypeOptions } from "@/src/lib/activity-types";
import { FALLBACK_ERROR, readGenerateResponse } from "@/src/lib/generate-client";
import { SAVE_MESSAGES } from "@/src/lib/save-activity";
import type { Activity, ActivityType } from "@/src/lib/schemas";
import { MAX_REQUEST_LENGTH } from "@/src/lib/schemas/generate-request";
import { saveActivity } from "./actions";
import { RefineChat } from "./RefineChat";
import { SharePanel } from "./SharePanel";

type SaveState = "idle" | "saving" | "saved" | "unsaved";

const SAVE_STATUS_TEXT: Record<SaveState, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  unsaved: "Unsaved changes",
};

type Props = {
  /** A saved activity to start from (the /activities/<id> page). */
  initial?: { id: string; activity: Activity; isPublic: boolean };
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
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [sharing, setSharing] = useState(false);
  // Goes up on every change to the activity, so a save that finishes after a
  // refine doesn't wrongly report "Saved".
  const version = useRef(0);
  const saving = saveState === "saving";
  const busy = creating || refining || saving || sharing;

  /** Forget the saved row: the next activity is a new one. */
  function resetSave() {
    version.current++;
    setSavedId(null);
    setSaveState("idle");
    setSaveError(null);
    setIsPublic(false);
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
      <Step number={1} title="Choose a type" headingId="step-type">
        <fieldset>
          <legend className="sr-only">What kind of activity?</legend>
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
                    "flex min-h-16 items-start gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 " +
                    (selected
                      ? "border-primary bg-tint"
                      : "border-line bg-surface enabled:hover:border-primary")
                  }
                >
                  {/* Radio-style marker: filled when chosen. aria-pressed carries the meaning. */}
                  <span
                    aria-hidden="true"
                    className={
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 " +
                      (selected ? "border-primary" : "border-line")
                    }
                  >
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </span>
                  <span>
                    <span className="block font-semibold">{option.label}</span>
                    <span className="mt-0.5 block text-sm text-muted">{option.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </Step>

      {type && (
        <Step number={2} title="Describe it" headingId="step-describe">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label htmlFor="request" className="text-muted">
              Say what you want, or paste your lesson notes. Include the grade and how many items.
            </label>
            <textarea
              id="request"
              name="request"
              rows={7}
              maxLength={MAX_REQUEST_LENGTH}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder={activityTypeInfo[type].placeholder}
              className="field leading-relaxed"
            />

            <button
              type="submit"
              disabled={busy || !request.trim()}
              aria-busy={creating}
              className="btn btn-primary mt-1 self-start"
            >
              {creating ? "Creating your activity…" : "Create activity"}
            </button>

            <div aria-live="polite" className="sr-only">
              {creating ? "Creating your activity…" : ""}
            </div>

            {error && (
              <p role="alert" className="alert alert-bad">
                {error}
              </p>
            )}
          </form>
        </Step>
      )}

      {activity && type && (
        <>
          <Step number={3} title="Check the draft" headingId="step-check">
            <p className="-mt-2 mb-5 text-muted">
              This is exactly what students will get. Read it through, then ask for any changes.
            </p>
            <div className="flex flex-col gap-8">
              <ActivityPreview activity={activity} />
              <RefineChat
                key={chatKey}
                type={type}
                activity={activity}
                onUpdated={handleRefined}
                onBusyChange={setRefining}
              />
            </div>
          </Step>

          <Step number={4} title="Save and share" headingId="step-share">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={busy || saveState === "saved"}
                  aria-busy={saving}
                  className="btn btn-primary"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <p
                  aria-live="polite"
                  className={
                    "text-sm font-semibold " + (saveState === "unsaved" ? "text-warn-ink" : "text-muted")
                  }
                >
                  {SAVE_STATUS_TEXT[saveState]}
                </p>
              </div>

              {saveError && (
                <p role="alert" className="alert alert-bad">
                  {saveError}
                </p>
              )}

              <SharePanel
                id={savedId}
                canShare={savedId !== null && saveState === "saved"}
                disabled={creating || refining || saving}
                isPublic={isPublic}
                onChange={setIsPublic}
                onBusyChange={setSharing}
              />
            </div>
          </Step>
        </>
      )}
    </div>
  );
}

/** One numbered step of the editor: a card with a number badge, heading, then the content. */
function Step({
  number,
  title,
  headingId,
  children,
}: {
  number: number;
  title: string;
  headingId: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={headingId} className="card p-5 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span aria-hidden="true" className="num">
          {number}
        </span>
        <h2 id={headingId} className="text-xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
