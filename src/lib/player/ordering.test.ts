import { describe, expect, test } from "vitest";
import { checkOrder, moveDown, moveItem, moveUp } from "./ordering";

describe("moveItem", () => {
  test("moves an item down, shifting the others up", () => {
    expect(moveItem([0, 1, 2, 3, 4], 1, 3)).toEqual([0, 2, 3, 1, 4]);
  });

  test("moves an item up, shifting the others down", () => {
    expect(moveItem([0, 1, 2, 3, 4], 3, 0)).toEqual([3, 0, 1, 2, 4]);
  });

  test("same position or out of range gives an unchanged copy", () => {
    const order = [2, 0, 1];
    expect(moveItem(order, 1, 1)).toEqual(order);
    expect(moveItem(order, -1, 0)).toEqual(order);
    expect(moveItem(order, 0, 3)).toEqual(order);
    expect(moveItem(order, 0, 1)).not.toBe(order);
  });

  test("doesn't change the input", () => {
    const order = [2, 0, 1];
    moveItem(order, 0, 2);
    expect(order).toEqual([2, 0, 1]);
  });
});

describe("moveUp / moveDown", () => {
  test("swap with the neighbour", () => {
    expect(moveUp([3, 1, 0, 2], 2)).toEqual([3, 0, 1, 2]);
    expect(moveDown([3, 1, 0, 2], 2)).toEqual([3, 1, 2, 0]);
  });

  test("do nothing at the ends", () => {
    expect(moveUp([3, 1, 0, 2], 0)).toEqual([3, 1, 0, 2]);
    expect(moveDown([3, 1, 0, 2], 3)).toEqual([3, 1, 0, 2]);
  });
});

describe("checkOrder", () => {
  test("all in the right place", () => {
    expect(checkOrder([0, 1, 2, 3])).toEqual({
      marks: [0, 1, 2, 3].map((item) => ({ item, right: true })),
      score: 4,
    });
  });

  test("none in the right place", () => {
    expect(checkOrder([1, 2, 3, 0]).score).toBe(0);
  });

  test("a mix: each row marked, score counts the right ones", () => {
    const { marks, score } = checkOrder([0, 2, 1, 3, 4]);
    expect(marks.map((m) => m.right)).toEqual([true, false, false, true, true]);
    expect(marks.map((m) => m.item)).toEqual([0, 2, 1, 3, 4]);
    expect(score).toBe(3);
  });
});
