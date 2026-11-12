"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  buildRefineBody,
  FALLBACK_ERROR,
  readGenerateResponse,
  type ChatMessage,
} from "@/src/lib/generate-client";
import type { Activity, ActivityType } from "@/src/lib/schemas";
import { MAX_REQUEST_LENGTH } from "@/src/lib/schemas/generate-request";

const DONE_REPLY = "Done. I've updated the activity.";

type Props = {
  type: ActivityType;
  activity: Activity;
  onUpdated: (activity: Activity) => void;
  onBusyChange: (busy: boolean) => void;
};

/** Chat box under the preview: the teacher asks for changes, the activity is regenerated. */
export function RefineChat({ type, activity, onUpdated, onBusyChange }: Props) {
  const [messages, setMessages] = useState<(ChatMessage & { id: number })[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(0);

  function setBusy(busy: boolean) {
    setSending(busy);
    onBusyChange(busy);
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (sending || !text) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRefineBody(type, text, messages, activity)),
      });
      const result = await readGenerateResponse(res);
      if (result.ok) {
        onUpdated(result.activity);
        setMessages((prev) => [
          ...prev,
          { id: nextId.current++, role: "teacher", text },
          { id: nextId.current++, role: "assistant", text: DONE_REPLY },
        ]);
        setDraft("");
      } else {
        // Keep the previous activity and the teacher's message so they can retry.
        setError(result.message);
      }
    } catch {
      setError(FALLBACK_ERROR);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="refine-heading" className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4 sm:p-5">
      <h3 id="refine-heading" className="text-base">
        Ask for changes
      </h3>

      {messages.length > 0 && (
        <ul className="flex flex-col gap-2">
          {messages.map((m) => (
            <li
              key={m.id}
              className={
                "max-w-[85%] rounded-2xl px-4 py-2 text-sm break-words whitespace-pre-wrap " +
                (m.role === "teacher"
                  ? "self-end bg-primary text-on-primary"
                  : "self-start border border-rule bg-surface text-ink")
              }
            >
              <span className="sr-only">{m.role === "teacher" ? "You: " : "Assistant: "}</span>
              {m.text}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSend} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="refine-input" className="sr-only">
          Ask for a change
        </label>
        <input
          id="refine-input"
          type="text"
          maxLength={MAX_REQUEST_LENGTH}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask for a change, like: make question 3 harder"
          className="field min-w-0 flex-1"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-busy={sending}
          className="btn btn-primary"
        >
          {sending ? "Updating…" : "Send"}
        </button>
      </form>

      <div aria-live="polite" className="sr-only">
        {sending ? "Updating…" : ""}
      </div>

      {error && (
        <p
          role="alert"
          className="alert alert-bad"
        >
          {error}
        </p>
      )}
    </section>
  );
}
