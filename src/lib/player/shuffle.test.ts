import { describe, expect, test } from "vitest";
import { derangedOrder, shuffle, shuffledOrder, type Random } from "./shuffle";

/** A small seeded random number generator (mulberry32), so results repeat. */
function seeded(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("shuffle", () => {
  test("keeps the same items and doesn't change the input", () => {
    const input = ["a", "b", "c", "d", "e"];
    const copy = [...input];
    const out = shuffle(input, seeded(1));
    expect([...out].sort()).toEqual([...input].sort());
    expect(input).toEqual(copy);
  });

  test("the same seed gives the same order; different seeds can differ", () => {
    expect(shuffle(range(8), seeded(42))).toEqual(shuffle(range(8), seeded(42)));
    const orders = new Set(range(20).map((s) => shuffle(range(8), seeded(s)).join(",")));
    expect(orders.size).toBeGreaterThan(1);
  });

  test("handles empty and single-item lists", () => {
    expect(shuffle([], seeded(1))).toEqual([]);
    expect(shuffle(["only"], seeded(1))).toEqual(["only"]);
  });
});

describe("shuffledOrder", () => {
  test("is a reordering of 0…n-1 that is never the original order (n ≥ 2)", () => {
    for (let n = 2; n <= 10; n++) {
      for (let seed = 0; seed < 1000; seed++) {
        const order = shuffledOrder(n, seeded(seed));
        expect(sorted(order)).toEqual(range(n));
        expect(order).not.toEqual(range(n));
      }
    }
  });

  test("still differs when the random source would leave everything in place", () => {
    // random() = 0.999… makes Fisher–Yates swap each item with itself.
    expect(shuffledOrder(4, () => 0.9999)).toEqual([1, 0, 2, 3]);
  });

  test("n = 1 and n = 0", () => {
    expect(shuffledOrder(1, seeded(1))).toEqual([0]);
    expect(shuffledOrder(0, seeded(1))).toEqual([]);
  });
});

describe("derangedOrder", () => {
  test("no item stays in its own place (n ≥ 2)", () => {
    for (let n = 2; n <= 10; n++) {
      for (let seed = 0; seed < 1000; seed++) {
        const order = derangedOrder(n, seeded(seed));
        expect(sorted(order)).toEqual(range(n));
        order.forEach((v, i) => expect(v).not.toBe(i));
      }
    }
  });

  test("works even with extreme random values", () => {
    for (const r of [0, 0.9999]) {
      const order = derangedOrder(6, () => r);
      order.forEach((v, i) => expect(v).not.toBe(i));
    }
  });

  test("varies with the seed", () => {
    const orders = new Set(range(50).map((s) => derangedOrder(6, seeded(s)).join(",")));
    expect(orders.size).toBeGreaterThan(5);
  });

  test("n = 1 and n = 0", () => {
    expect(derangedOrder(1, seeded(1))).toEqual([0]);
    expect(derangedOrder(0, seeded(1))).toEqual([]);
  });
});
