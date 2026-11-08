import type { FlashcardsActivity } from "@/src/lib/schemas";
import { PreviewHeader } from "./header";

// Read-only preview for the teacher. Every piece of AI text is placed as a
// plain {value} child, so React escapes it. Never use dangerouslySetInnerHTML here.
export function FlashcardsPreview({ activity }: { activity: FlashcardsActivity }) {
  return (
    <section aria-labelledby="preview-title" className="flex flex-col gap-4">
      <PreviewHeader title={activity.title} instructions={activity.instructions} />

      <ol className="flex flex-col gap-4">
        {activity.cards.map((card, i) => (
          <li key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                Card {i + 1} · Front
              </p>
              <p className="mt-1 font-medium break-words">{card.front}</p>
            </div>
            <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                Back
              </p>
              <p className="mt-1 break-words">{card.back}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
