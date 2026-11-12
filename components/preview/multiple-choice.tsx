import type { MultipleChoiceActivity } from "@/src/lib/schemas";
import { PreviewHeader, previewSheet } from "./header";

// Read-only preview for the teacher. Every piece of AI text is placed as a
// plain {value} child, so React escapes it. Never use dangerouslySetInnerHTML here.
export function MultipleChoicePreview({ activity }: { activity: MultipleChoiceActivity }) {
  return (
    <section aria-labelledby="preview-title" className={previewSheet}>
      <PreviewHeader title={activity.title} instructions={activity.instructions} />

      <ol className="flex flex-col gap-8">
        {activity.questions.map((q, qi) => (
          <li key={qi}>
            <p className="flex gap-3 font-semibold break-words">
              <span aria-hidden="true" className="num">
                {qi + 1}
              </span>
              <span className="min-w-0 pt-0.5">{q.question}</span>
            </p>

            <ul className="mt-3 flex flex-col gap-1.5 sm:pl-10">
              {q.options.map((option, oi) => (
                <li
                  key={oi}
                  className={
                    "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 " +
                    (option.isCorrect ? "border-good-line bg-good-bg" : "border-transparent")
                  }
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="w-4 shrink-0 font-semibold text-muted">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="min-w-0 break-words">{option.text}</span>
                  </span>
                  {option.isCorrect && (
                    <span className="shrink-0 text-sm font-semibold text-good-ink">✓ Correct</span>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-sm break-words text-muted sm:pl-10">
              <span className="font-semibold text-ink">Why: </span>
              {q.explanation}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
