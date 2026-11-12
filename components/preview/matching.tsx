import type { MatchingActivity } from "@/src/lib/schemas";
import { PreviewHeader, previewSheet } from "./header";

// Read-only preview for the teacher. Every piece of AI text is placed as a
// plain {value} child, so React escapes it. Never use dangerouslySetInnerHTML here.
// Pairs are shown in the order the AI gave them (already matched); the student
// view shuffles them.
export function MatchingPreview({ activity }: { activity: MatchingActivity }) {
  return (
    <section aria-labelledby="preview-title" className={previewSheet}>
      <PreviewHeader title={activity.title} instructions={activity.instructions} />

      <p className="-mt-2 text-sm text-muted">Shown matched. Students see the right column shuffled.</p>

      <ol className="flex flex-col divide-y divide-rule border-y border-rule">
        {activity.pairs.map((pair, i) => (
          <li
            key={i}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-3 sm:gap-4"
          >
            <span aria-hidden="true" className="num">
              {i + 1}
            </span>
            <span className="min-w-0 font-semibold break-words">{pair.left}</span>
            <span aria-hidden="true" className="text-muted">
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
