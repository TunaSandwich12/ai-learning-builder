import type { TrueFalseActivity } from "@/src/lib/schemas";
import { PreviewHeader, previewSheet } from "./header";

// Read-only preview for the teacher. Every piece of AI text is placed as a
// plain {value} child, so React escapes it. Never use dangerouslySetInnerHTML here.
export function TrueFalsePreview({ activity }: { activity: TrueFalseActivity }) {
  return (
    <section aria-labelledby="preview-title" className={previewSheet}>
      <PreviewHeader title={activity.title} instructions={activity.instructions} />

      <ol className="flex flex-col gap-7">
        {activity.statements.map((s, i) => (
          <li key={i}>
            <div className="flex items-start justify-between gap-4">
              <p className="flex min-w-0 gap-3 font-semibold break-words">
                <span aria-hidden="true" className="num">
                  {i + 1}
                </span>
                <span className="min-w-0 pt-0.5">{s.statement}</span>
              </p>
              {/* The word carries the meaning; colour is only extra. */}
              <span
                className={
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-sm font-semibold " +
                  (s.isTrue
                    ? "border-good-line bg-good-bg text-good-ink"
                    : "border-bad-line bg-bad-bg text-bad-ink")
                }
              >
                <span aria-hidden="true">{s.isTrue ? "✓ " : "✗ "}</span>
                {s.isTrue ? "True" : "False"}
              </span>
            </div>

            <p className="mt-2 text-sm break-words text-muted sm:pl-10">
              <span className="font-semibold text-ink">Why: </span>
              {s.explanation}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
