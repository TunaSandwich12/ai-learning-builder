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
      <p className="text-sm font-medium text-muted">
        {label} {index + 1} of {total}
      </p>
      <div aria-hidden="true" className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
