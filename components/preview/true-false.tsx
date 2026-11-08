import type { TrueFalseActivity } from "@/src/lib/schemas";
import { PreviewHeader } from "./header";

// Read-only preview for the teacher. Every piece of AI text is placed as a
// plain {value} child, so React escapes it. Never use dangerouslySetInnerHTML here.
export function TrueFalsePreview({ activity }: { activity: TrueFalseActivity }) {
  return (
    <section aria-labelledby="preview-title" className="flex flex-col gap-4">
      <PreviewHeader title={activity.title} instructions={activity.instructions} />

      <ol className="flex flex-col gap-4">
        {activity.statements.map((s, i) => (
          <li key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-medium break-words">
                <span className="text-zinc-500 dark:text-zinc-400">{i + 1}. </span>
                {s.statement}
              </p>
              {/* The word carries the meaning; colour is only extra. */}
              <span
                className={
                  "shrink-0 rounded-md px-2 py-0.5 text-sm font-semibold " +
                  (s.isTrue
                    ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300")
                }
              >
                <span aria-hidden="true">{s.isTrue ? "✓ " : "✗ "}</span>
                {s.isTrue ? "True" : "False"}
              </span>
            </div>

            <p className="mt-3 text-sm text-zinc-600 break-words dark:text-zinc-400">
              <span className="font-semibold">Why: </span>
              {s.explanation}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
