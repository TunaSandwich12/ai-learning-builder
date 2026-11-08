import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { samples } from "@/src/lib/samples";
import type { Activity } from "@/src/lib/schemas";
import { ActivityPlayer } from "./ActivityPlayer";

// Server rendering, as on the first page load. Shuffled players must not shuffle here.
const render = (activity: Activity) => renderToStaticMarkup(<ActivityPlayer activity={activity} />);
const escaped = (s: string) => s.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/</g, "&lt;");

describe("ActivityPlayer", () => {
  test("no type says coming soon any more", () => {
    for (const sample of Object.values(samples)) {
      expect(render(sample)).not.toContain("coming soon");
    }
  });

  test("every type shows its title and instructions", () => {
    for (const sample of Object.values(samples)) {
      const html = render(sample);
      expect(html).toContain(escaped(sample.title));
      expect(html).toContain(escaped(sample.instructions));
    }
  });

  test("multiple choice starts on question 1 with no answers shown", () => {
    const { questions } = samples.multiple_choice;
    const html = render(samples.multiple_choice);
    expect(html).toContain(`Question 1 of ${questions.length}`);
    expect(html).toContain(escaped(questions[0].options[0].text));
    expect(html).not.toMatch(/Correct|Not quite|Why:/);
    expect(html).not.toContain(escaped(questions[0].explanation));
    expect(html).not.toContain(escaped(questions[1].question));
  });

  test("true/false starts on statement 1 with big True and False buttons and no answer", () => {
    const { statements } = samples.true_false;
    const html = render(samples.true_false);
    expect(html).toContain(`Statement 1 of ${statements.length}`);
    expect(html).toContain(escaped(statements[0].statement));
    expect(html).toMatch(/>True<\/button>/);
    expect(html).toMatch(/>False<\/button>/);
    expect(html).not.toMatch(/Correct|Not quite|Why:|This statement is/);
    expect(html).not.toContain(escaped(statements[0].explanation));
  });

  test("flashcards show the front of card 1, not the back, and no rating yet", () => {
    const { cards } = samples.flashcards;
    const html = render(samples.flashcards);
    expect(html).toContain(`Card 1 of ${cards.length}`);
    expect(html).toContain(escaped(cards[0].front));
    expect(html).not.toContain(escaped(cards[0].back));
    expect(html).toContain("Tap to flip");
    expect(html).not.toContain("I knew it");
  });

  test.each(["matching", "ordering"] as const)(
    "%s doesn't render (or shuffle) on the server: shows Getting ready",
    (type) => {
      const html = render(samples[type]);
      expect(html).toContain("Getting ready…");
      // None of the shuffled content is in the server HTML, so it can't mismatch.
      if (type === "matching") {
        for (const p of samples.matching.pairs) expect(html).not.toContain(escaped(p.right));
      } else {
        for (const item of samples.ordering.items) expect(html).not.toContain(escaped(item));
      }
    },
  );

  test("AI text is escaped, never HTML", () => {
    const evil = `<img src=x onerror="alert(1)">`;
    const q = samples.multiple_choice.questions[0];
    const cases: Activity[] = [
      {
        ...samples.multiple_choice,
        title: evil,
        instructions: evil,
        questions: [{ ...q, question: evil, options: q.options.map((o) => ({ ...o, text: evil })) }],
      },
      { ...samples.true_false, title: evil, statements: [{ statement: evil, isTrue: true, explanation: evil }] },
      { ...samples.flashcards, title: evil, cards: [{ front: evil, back: evil }] },
      { ...samples.matching, title: evil, instructions: evil },
      { ...samples.ordering, title: evil, instructions: evil },
    ];
    for (const activity of cases) {
      const html = render(activity);
      expect(html).not.toContain("<img");
      expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    }
  });
});
