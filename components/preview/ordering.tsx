import type { OrderingActivity } from "@/src/lib/schemas";
import { PreviewHeader } from "./header";

// Read-only preview for the teacher. Every piece of AI text is placed as a
// plain {value} child, so React escapes it. Never use dangerouslySetInnerHTML here.
export function OrderingPreview({ activity }: { activity: OrderingActivity }) {
  return (
    <section aria-labelledby="preview-title" className="flex flex-col gap-4">
      <PreviewHeader title={activity.title} instructions={activity.instructions} />

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Shown in the correct order. Students will see them shuffled.
      </p>

      <ol className="flex flex-col gap-3">
        {activity.items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold dark:bg-zinc-800">
              {i + 1}
            </span>
            <span className="min-w-0 pt-0.5 break-words">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
