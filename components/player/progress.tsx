/** "Question 2 of 10" with a thin progress bar. */
export function Progress({
  label,
  index,
  total,
  done,
}: {
  /** "Question", "Statement", "Card"… */
  label: string;
  /** The current item, 0-based. */
  index: number;
  total: number;
  /** True once the current item is answered (fills its share of the bar). */
  done: boolean;
}) {
  const percent = total > 0 ? ((index + (done ? 1 : 0)) / total) * 100 : 0;
  return (
    <div>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {label} {index + 1} of {total}
      </p>
      <div
        aria-hidden="true"
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div
          className="h-full rounded-full bg-zinc-900 transition-[width] motion-reduce:transition-none dark:bg-zinc-100"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
