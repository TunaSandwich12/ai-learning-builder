import type { MultipleChoiceActivity } from "@/src/lib/schemas";

// Read-only preview for the teacher. Every piece of AI text is placed as a
// plain {value} child, so React escapes it. Never use dangerouslySetInnerHTML here.
export function MultipleChoicePreview({ activity }: { activity: MultipleChoiceActivity }) {
  return (
    <section aria-labelledby="preview-title" className="flex flex-col gap-4">
      <div>
        <h2 id="preview-title" className="text-xl font-bold break-words">
          {activity.title}
        </h2>
        <p className="mt-1 text-zinc-600 break-words dark:text-zinc-400">
          {activity.instructions}
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {activity.questions.map((q, qi) => (
          <li key={qi} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="font-medium break-words">
              <span className="text-zinc-500 dark:text-zinc-400">{qi + 1}. </span>
              {q.question}
            </p>

            <ul className="mt-3 flex flex-col gap-2">
              {q.options.map((option, oi) => (
                <li
                  key={oi}
                  className={
                    "flex items-start justify-between gap-3 rounded-lg border px-3 py-2 " +
                    (option.isCorrect
                      ? "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-950"
                      : "border-zinc-200 dark:border-zinc-800")
                  }
                >
                  <span className="min-w-0 break-words">{option.text}</span>
                  {option.isCorrect && (
                    <span className="shrink-0 text-sm font-semibold text-green-800 dark:text-green-300">
                      ✓ Correct
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-sm text-zinc-600 break-words dark:text-zinc-400">
              <span className="font-semibold">Why: </span>
              {q.explanation}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
