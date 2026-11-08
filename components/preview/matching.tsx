import type { MatchingActivity } from "@/src/lib/schemas";
import { PreviewHeader } from "./header";

// Read-only preview for the teacher. Every piece of AI text is placed as a
// plain {value} child, so React escapes it. Never use dangerouslySetInnerHTML here.
// Pairs are shown in the order the AI gave them (already matched); the student
// view shuffles them.
export function MatchingPreview({ activity }: { activity: MatchingActivity }) {
  return (
    <section aria-labelledby="preview-title" className="flex flex-col gap-4">
      <PreviewHeader title={activity.title} instructions={activity.instructions} />

      <ol className="flex flex-col gap-3">
        {activity.pairs.map((pair, i) => (
          <li
            key={i}
            className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 rounded-lg border border-zinc-200 px-3 py-3 sm:gap-3 sm:px-4 dark:border-zinc-800"
          >
            <span className="min-w-0 font-medium break-words">{pair.left}</span>
            <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-500">
              →
            </span>
            <span className="sr-only"> matches </span>
            <span className="min-w-0 break-words">{pair.right}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
