"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { checkOrder, moveDown, moveItem, moveUp } from "@/src/lib/player/ordering";
import { shuffledOrder } from "@/src/lib/player/shuffle";
import type { OrderingActivity } from "@/src/lib/schemas";
import { ClientOnly, GettingReady } from "./client-only";
import { BigButton, ScoreScreen } from "./score-screen";

type Direction = "up" | "down";

// Student player. Every piece of AI text is placed as a plain {value} child, so
// React escapes it. Never use dangerouslySetInnerHTML here.
export function OrderingPlayer({ activity }: { activity: OrderingActivity }) {
  // The items start shuffled, so the list is only rendered in the browser.
  return (
    <ClientOnly fallback={<GettingReady />}>
      <OrderingGame activity={activity} />
    </ClientOnly>
  );
}

function OrderingGame({ activity }: { activity: OrderingActivity }) {
  const { items } = activity;
  const n = items.length;
  // order[position] = the item's correct position. shuffledOrder never returns
  // the correct order (for n ≥ 2). This component only mounts in the browser.
  const [order, setOrder] = useState(() => shuffledOrder(n));
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const listRef = useRef<HTMLOListElement>(null);
  const moveButtons = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<{ item: number; dir: Direction } | null>(null);

  // After a Move up / Move down, keep focus on that item's button (or its other
  // button if this one is now disabled at the top or bottom).
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const other: Direction = target.dir === "up" ? "down" : "up";
    const el = moveButtons.current.get(`${target.item}-${target.dir}`);
    (el && !el.disabled ? el : moveButtons.current.get(`${target.item}-${other}`))?.focus();
  }, [order]);

  if (finished) {
    return (
      <ScoreScreen
        correct={checkOrder(order).score}
        total={n}
        onPlayAgain={() => {
          setOrder(shuffledOrder(n));
          setChecked(false);
          setFinished(false);
          setAnnouncement("");
        }}
      />
    );
  }

  const { marks, score } = checkOrder(order);

  function announcePosition(item: number, nextOrder: number[]) {
    setAnnouncement(`Moved to position ${nextOrder.indexOf(item) + 1} of ${n}.`);
  }

  function move(position: number, dir: Direction) {
    const item = order[position];
    const next = dir === "up" ? moveUp(order, position) : moveDown(order, position);
    pendingFocus.current = { item, dir };
    setOrder(next);
    announcePosition(item, next);
  }

  // Dragging with Pointer Events (mouse, touch and pen). Only the handle has
  // touch-action: none, so the page still scrolls everywhere else.
  function startDrag(event: PointerEvent<HTMLDivElement>, item: number) {
    if (checked) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(item);
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    if (dragging === null) return;
    const rows = listRef.current?.children;
    if (!rows) return;
    const position = order.indexOf(dragging);
    const y = event.clientY;
    // Move one place when the finger crosses the middle of the row above or below.
    const above = position > 0 ? rows[position - 1].getBoundingClientRect() : null;
    const below = position < n - 1 ? rows[position + 1].getBoundingClientRect() : null;
    if (above && y < above.top + above.height / 2) setOrder(moveItem(order, position, position - 1));
    else if (below && y > below.top + below.height / 2) setOrder(moveItem(order, position, position + 1));
  }

  function endDrag() {
    if (dragging === null) return;
    announcePosition(dragging, order);
    setDragging(null);
  }

  const moveButtonClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-lg enabled:hover:border-primary disabled:opacity-30";

  return (
    <section aria-label="Put in order" className="flex flex-col gap-5">
      <p className="text-sm font-medium text-muted">
        {checked
          ? `${score} of ${n} in the right place.`
          : "Drag the handle, or use the arrows, to put the items in order (first at the top)."}
      </p>

      <ol ref={listRef} className="flex flex-col gap-2">
        {order.map((item, position) => {
          const mark = marks[position];
          const isDragging = dragging === item;
          return (
            <li
              key={item}
              className={
                "flex items-center gap-2 rounded-2xl border-[1.5px] p-2 " +
                (checked
                  ? mark.right
                    ? "border-good-line bg-good-bg"
                    : "border-bad-line bg-bad-bg"
                  : isDragging
                    ? "relative z-10 border-primary bg-tint"
                    : "border-line bg-surface")
              }
            >
              {!checked && (
                // Pointer-only drag handle; keyboard and screen reader users use the
                // Move up / Move down buttons, so it's hidden from them.
                <div
                  aria-hidden="true"
                  onPointerDown={(e) => startDrag(e, item)}
                  onPointerMove={drag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  className="flex h-11 w-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-xl text-muted select-none active:cursor-grabbing"
                >
                  ⠿
                </div>
              )}

              <span className="num">
                {position + 1}
              </span>

              <div className="min-w-0 flex-1 py-1">
                <p className="break-words">{items[item]}</p>
                {checked && (
                  <p
                    className={
                      "mt-1 text-sm font-semibold " + (mark.right ? "text-good-ink" : "text-bad-ink")
                    }
                  >
                    {mark.right ? "✓ Right place" : `✗ Should be #${item + 1}`}
                  </p>
                )}
              </div>

              {!checked && (
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                  <button
                    ref={(el) => {
                      if (el) moveButtons.current.set(`${item}-up`, el);
                      else moveButtons.current.delete(`${item}-up`);
                    }}
                    type="button"
                    onClick={() => move(position, "up")}
                    disabled={position === 0}
                    aria-label={`Move up: ${items[item]}`}
                    className={moveButtonClass}
                  >
                    <span aria-hidden="true">↑</span>
                  </button>
                  <button
                    ref={(el) => {
                      if (el) moveButtons.current.set(`${item}-down`, el);
                      else moveButtons.current.delete(`${item}-down`);
                    }}
                    type="button"
                    onClick={() => move(position, "down")}
                    disabled={position === n - 1}
                    aria-label={`Move down: ${items[item]}`}
                    className={moveButtonClass}
                  >
                    <span aria-hidden="true">↓</span>
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {checked ? (
        <BigButton onClick={() => setFinished(true)} className="sm:w-auto sm:self-start">
          See my score
        </BigButton>
      ) : (
        <BigButton
          onClick={() => {
            setChecked(true);
            setAnnouncement(`${score} of ${n} in the right place.`);
          }}
          className="sm:w-auto sm:self-start"
        >
          Check my order
        </BigButton>
      )}
    </section>
  );
}
