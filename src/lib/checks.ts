// Plain logic, safe to import from server actions, routes and tests.
// No AI or server-only imports here.
import type { Activity } from "@/src/lib/schemas";

/**
 * Rules the schemas can only describe (structured outputs don't enforce counts).
 * Returns a list of problems; empty means the activity is usable.
 */
export function checkActivity(activity: Activity): string[] {
  const problems: string[] = [];
  const blank = (s: string) => s.trim().length === 0;

  if (blank(activity.title)) problems.push("title is empty");
  if (blank(activity.instructions)) problems.push("instructions are empty");

  switch (activity.type) {
    case "multiple_choice":
      if (activity.questions.length === 0) problems.push("no questions");
      activity.questions.forEach((q, i) => {
        if (blank(q.question)) problems.push(`question ${i + 1} is empty`);
        if (q.options.length !== 4) {
          problems.push(`question ${i + 1} has ${q.options.length} options, not 4`);
        }
        const correct = q.options.filter((o) => o.isCorrect).length;
        if (correct !== 1) problems.push(`question ${i + 1} has ${correct} correct options, not 1`);
        if (q.options.some((o) => blank(o.text))) problems.push(`question ${i + 1} has an empty option`);
      });
      break;
    case "true_false":
      if (activity.statements.length === 0) problems.push("no statements");
      if (activity.statements.some((s) => blank(s.statement))) problems.push("a statement is empty");
      break;
    case "flashcards":
      if (activity.cards.length === 0) problems.push("no cards");
      if (activity.cards.some((c) => blank(c.front) || blank(c.back))) problems.push("a card is empty");
      break;
    case "matching":
      if (activity.pairs.length === 0) problems.push("no pairs");
      if (activity.pairs.some((p) => blank(p.left) || blank(p.right))) problems.push("a pair is empty");
      break;
    case "ordering":
      if (activity.items.length === 0) problems.push("no items");
      if (activity.items.some(blank)) problems.push("an item is empty");
      break;
  }

  return problems;
}
