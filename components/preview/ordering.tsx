import type { OrderingActivity } from "@/src/lib/schemas";
import { PreviewHeader, previewSheet } from "./header";

// Read-only preview for the teacher. Every piece of AI text is placed as a
// plain {value} child, so React escapes it. Never use dangerouslySetInnerHTML here.
export function OrderingPreview({ activity }: { activity: OrderingActivity }) {
  return (
    <section aria-labelledby="preview-title" className={previewSheet}>
      <PreviewHeader title={activity.title} instructions={activity.instructions} />

      <p className="-mt-2 text-sm text-muted">Shown in the correct order. Students see them shuffled.</p>

      <ol className="flex flex-col divide-y divide-rule border-y border-rule">
        {activity.items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 py-3">
            <span aria-hidden="true" className="num">
              {i + 1}
            </span>
            <span className="min-w-0 break-words">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
