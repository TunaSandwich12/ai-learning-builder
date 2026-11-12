import type { FlashcardsActivity } from "@/src/lib/schemas";
import { PreviewHeader, previewSheet } from "./header";

// Read-only preview for the teacher. Every piece of AI text is placed as a
// plain {value} child, so React escapes it. Never use dangerouslySetInnerHTML here.
export function FlashcardsPreview({ activity }: { activity: FlashcardsActivity }) {
  return (
    <section aria-labelledby="preview-title" className={previewSheet}>
      <PreviewHeader title={activity.title} instructions={activity.instructions} />

      <ol className="flex flex-col gap-4">
        {activity.cards.map((card, i) => (
          <li
            key={i}
            className="grid rounded-xl border border-rule sm:grid-cols-[auto_minmax(0,2fr)_minmax(0,3fr)]"
          >
            <span aria-hidden="true" className="num mt-3 ml-4">
              {i + 1}
            </span>
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-muted">Front</p>
              <p className="mt-1 font-semibold break-words">{card.front}</p>
            </div>
            <div className="rounded-b-xl border-t border-rule bg-surface-2 px-4 py-3 sm:rounded-r-xl sm:rounded-bl-none sm:border-t-0 sm:border-l">
              <p className="text-sm font-medium text-muted">Back</p>
              <p className="mt-1 break-words">{card.back}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
