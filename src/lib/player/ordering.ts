// Logic for the ordering player. Plain functions (no React) so the rules and
// scoring can be unit tested.
//
// `order` is the list as the student currently sees it: order[position] = the
// item's correct position (its index in activity.items). An item is in the right
// place when order[position] === position.

/** Moves the item at `from` to `to`, shifting the others. Returns a new array. */
export function moveItem(order: readonly number[], from: number, to: number): number[] {
  const n = order.length;
  if (from === to || from < 0 || from >= n || to < 0 || to >= n) return [...order];
  const out = [...order];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

/** Moves the item at `position` up one place (no change at the top). */
export const moveUp = (order: readonly number[], position: number) =>
  moveItem(order, position, position - 1);

/** Moves the item at `position` down one place (no change at the bottom). */
export const moveDown = (order: readonly number[], position: number) =>
  moveItem(order, position, position + 1);

export type OrderMark = {
  /** The item's correct position (its index in activity.items). */
  item: number;
  /** True when it's where it belongs. */
  right: boolean;
};

/** Marks each row right or wrong. Score = items in the right place. */
export function checkOrder(order: readonly number[]): { marks: OrderMark[]; score: number } {
  const marks = order.map((item, position) => ({ item, right: item === position }));
  return { marks, score: marks.filter((m) => m.right).length };
}
