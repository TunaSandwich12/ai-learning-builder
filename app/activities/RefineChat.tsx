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
    <section aria-labelledby="refine-heading" className="flex flex-col gap-3">
      <h2 id="refine-heading" className="text-base font-semibold">
        Make changes
      </h2>

      {messages.length > 0 && (
        <ul className="flex flex-col gap-2">
          {messages.map((m) => (
            <li
              key={m.id}
              className={
                "max-w-[85%] rounded-lg px-3 py-2 text-sm break-words whitespace-pre-wrap " +
                (m.role === "teacher"
                  ? "self-end bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "self-start bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100")
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
          className="h-12 min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-300 dark:focus:ring-zinc-300/20"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-busy={sending}
          className="h-12 rounded-lg bg-zinc-900 px-6 text-base font-semibold text-white active:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300"
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
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 break-words dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}
    </section>
  );
}
