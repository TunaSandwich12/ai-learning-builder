// Shuffling for the players. Plain functions that take the random number
// source as a parameter, so tests can pass a seeded one and get repeatable results.
// Call these in the browser only (see components/player/client-only.tsx), so the
// server and the browser never render different orders.

export type Random = () => number; // like Math.random: [0, 1)

const randomInt = (random: Random, below: number) => Math.floor(random() * below);

/** A fair (Fisher–Yates) shuffle. Returns a new array; the input is not changed. */
export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(random, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * A shuffled list of the positions 0…n-1 that, for n ≥ 2, is never the original
 * order [0, 1, …, n-1]. Some items may still be in their own place; only the
 * whole order is guaranteed to differ. (If the shuffle comes out in order, the
 * first two are swapped, which always ends, unlike reshuffling until different.)
 */
export function shuffledOrder(n: number, random: Random = Math.random): number[] {
  const order = shuffle(
    Array.from({ length: n }, (_, i) => i),
    random,
  );
  if (n >= 2 && order.every((v, i) => v === i)) [order[0], order[1]] = [order[1], order[0]];
  return order;
}

/**
 * A shuffled list of the positions 0…n-1 where, for n ≥ 2, NO item stays in its
 * own place (order[i] !== i for every i). Uses Sattolo's algorithm, which makes a
 * random single cycle through all items: always finishes in one pass, though it
 * doesn't produce every possible such arrangement. For n = 1 returns [0].
 */
export function derangedOrder(n: number, random: Random = Math.random): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = randomInt(random, i); // j < i, never i itself: this is what moves every item
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
