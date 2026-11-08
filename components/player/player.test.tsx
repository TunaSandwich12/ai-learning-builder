import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { samples } from "@/src/lib/samples";
import type { Activity } from "@/src/lib/schemas";
import { ActivityPlayer } from "./ActivityPlayer";

const render = (activity: Activity) => renderToStaticMarkup(<ActivityPlayer activity={activity} />);

describe("ActivityPlayer", () => {
  test("multiple choice starts on question 1 with no answers shown", () => {
    const html = render(samples.multiple_choice);
    const first = samples.multiple_choice.questions[0];
    expect(html).toContain(`Question 1 of ${samples.multiple_choice.questions.length}`);
    expect(html).toContain(first.options[0].text);
    // Nothing gives the answer away before the student picks.
    expect(html).not.toMatch(/Correct|Not quite|Why:/);
    expect(html).not.toContain(first.explanation);
    // Only the first question is on screen.
    expect(html).not.toContain(samples.multiple_choice.questions[1].question);
  });

  test.each(["true_false", "flashcards", "matching", "ordering"] as const)(
    "%s shows coming soon",
    (type) => {
      const html = render(samples[type]);
      expect(html).toContain("This activity type is coming soon.");
      expect(html).toContain(samples[type].title.replace(/'/g, "&#x27;"));
    },
  );

  test("AI text is escaped, never HTML", () => {
    const evil = `<img src=x onerror="alert(1)">`;
    const q = samples.multiple_choice.questions[0];
    const html = render({
      ...samples.multiple_choice,
      title: evil,
      instructions: evil,
      questions: [{ ...q, question: evil, options: q.options.map((o) => ({ ...o, text: evil })) }],
    });
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });
});
