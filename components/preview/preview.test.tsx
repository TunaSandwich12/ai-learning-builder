import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { samples } from "@/src/lib/samples";
import type { Activity } from "@/src/lib/schemas";
import { ActivityPreview } from "./index";

const render = (activity: Activity) => renderToStaticMarkup(<ActivityPreview activity={activity} />);

/** Text as React escapes it in HTML, so we can look for it in the markup. */
const escaped = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");

/** The position of each string in the markup, in the order given. */
const positions = (html: string, texts: string[]) => texts.map((t) => html.indexOf(escaped(t)));

describe("ActivityPreview", () => {
  test.each(Object.values(samples).map((s) => [s.type, s] as const))(
    "%s shows the title, instructions and every item",
    (_type, sample) => {
      const html = render(sample);
      expect(html).toContain(escaped(sample.title));
      expect(html).toContain(escaped(sample.instructions));
      expect(html).not.toContain("Preview coming");

      const texts: string[] = (() => {
        switch (sample.type) {
          case "multiple_choice":
            return sample.questions.flatMap((q) => [q.question, ...q.options.map((o) => o.text), q.explanation]);
          case "true_false":
            return sample.statements.flatMap((s) => [s.statement, s.explanation]);
          case "flashcards":
            return sample.cards.flatMap((c) => [c.front, c.back]);
          case "matching":
            return sample.pairs.flatMap((p) => [p.left, p.right]);
          case "ordering":
            return sample.items;
        }
      })();
      for (const text of texts) expect(html).toContain(escaped(text));
    },
  );

  test("true/false labels each statement True or False in words", () => {
    const html = render(samples.true_false);
    const labels = [...html.matchAll(/<\/span>(True|False)<\/span>/g)].map((m) => m[1]);
    expect(labels).toEqual(samples.true_false.statements.map((s) => (s.isTrue ? "True" : "False")));
  });

  test("flashcards label the front and back of every card", () => {
    const html = render(samples.flashcards);
    const n = samples.flashcards.cards.length;
    expect(html.match(/· Front/g)).toHaveLength(n);
    expect(html.match(/>Back</g)).toHaveLength(n);
  });

  test("matching keeps the AI's pair order, left before right", () => {
    const { pairs } = samples.matching;
    const html = render(samples.matching);
    const order = positions(html, pairs.flatMap((p) => [p.left, p.right]));
    expect(order.every((pos) => pos >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(html.match(/→/g)).toHaveLength(pairs.length);
  });

  test("ordering lists the items numbered 1…n in the correct order", () => {
    const { items } = samples.ordering;
    const html = render(samples.ordering);
    const order = positions(html, items);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    items.forEach((item, i) => {
      expect(html).toContain(`>${i + 1}</span><span class="min-w-0 pt-0.5 break-words">${escaped(item)}<`);
    });
  });

  describe("AI text is plain text, never HTML", () => {
    const evil = `<img src=x onerror="alert(1)">`;
    const cases: Activity[] = [
      {
        ...samples.multiple_choice,
        title: evil,
        questions: [{ ...samples.multiple_choice.questions[0], question: evil }],
      },
      { ...samples.true_false, instructions: evil, statements: [{ statement: evil, isTrue: true, explanation: evil }] },
      { ...samples.flashcards, cards: [{ front: evil, back: evil }] },
      { ...samples.matching, pairs: [{ left: evil, right: evil }] },
      { ...samples.ordering, items: [evil] },
    ];

    test.each(cases.map((c) => [c.type, c] as const))("%s escapes HTML in AI text", (_type, activity) => {
      const html = render(activity);
      expect(html).not.toContain("<img");
      expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    });
  });
});
