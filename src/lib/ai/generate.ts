import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { schemas, type Activity } from "@/src/lib/schemas";
import type { GenerateRequest } from "@/src/lib/schemas/generate-request";

const MODEL = "claude-sonnet-5-5";

// Must stay under the route's maxDuration (60s). No retries: a retry after a 429
// could run past 60s and the platform would kill the request with no friendly message.
const TIMEOUT_MS = 55_000;

export const MESSAGES = {
  badKey: "The AI key isn't working",
  busy: "The AI is busy, try again in a minute",
  generic: "Sorry, something went wrong. Please try again.",
} as const;

export type GenerateResult =
  | { ok: true; activity: Activity }
  | { ok: false; status: 429 | 500 | 502; message: string };

export const SYSTEM_PROMPT = `You create short learning activities for teachers in South Africa. Students do these activities on mobile phones, often on small screens and slow data.

Rules:
- Keep all text short and simple. Use short sentences and everyday words that suit the students' grade. Questions, options and answers must fit easily on a phone screen.
- Facts must be correct. Only include facts you are sure of. Never invent facts, names, dates or numbers.
- Match the grade the teacher gives. If no grade is given, pick a level that suits the topic. Follow the South African CAPS curriculum where relevant, and use South African English spelling and local examples (rand, metric units, South African places and names) where they fit naturally.
- If the teacher pasted notes or text, base the activity on that material first.
- Multiple choice: every question has exactly 4 options, exactly one of them correct, and the other 3 plausible but clearly wrong. Vary where the correct option appears.
- Write plain text only. No HTML, no Markdown, no asterisks, hashes or bullet symbols, no emoji.
- If you are editing an existing activity, change only what the teacher asks for and keep the rest the same.
- Follow the length and count rules in the field descriptions.`;

/** Builds the single user message: activity type, chat history, current activity, request. */
export function buildUserMessage(input: GenerateRequest): string {
  const parts: string[] = [`<activity_type>${input.type}</activity_type>`];

  if (input.history.length > 0) {
    const lines = input.history.map(
      (turn) => `${turn.role === "teacher" ? "Teacher" : "Assistant"}: ${turn.text}`,
    );
    parts.push(`<chat_history>\n${lines.join("\n")}\n</chat_history>`);
  }

  if (input.current) {
    parts.push(
      "This is the activity the teacher is editing. Change it as they ask and keep everything they didn't ask to change.",
      `<current_activity>\n${JSON.stringify(input.current, null, 2)}\n</current_activity>`,
    );
  }

  parts.push(`<teacher_request>\n${input.request}\n</teacher_request>`);
  return parts.join("\n\n");
}

/**
 * Rules the schemas can only describe (structured outputs don't enforce counts).
 * Returns a list of problems; empty means the activity is usable.
 */
export function findProblems(activity: Activity): string[] {
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

/** Calls Claude to create or edit an activity. Never throws. */
export async function generateActivity(input: GenerateRequest): Promise<GenerateResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("generateActivity: ANTHROPIC_API_KEY is not set");
    return { ok: false, status: 502, message: MESSAGES.badKey };
  }

  try {
    const client = new Anthropic({ apiKey, timeout: TIMEOUT_MS, maxRetries: 0 });

    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(input) }],
      output_config: { format: zodOutputFormat(schemas[input.type]), effort: "low" },
    });

    const activity = response.parsed_output as Activity | null;
    if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens" || !activity) {
      console.error("generateActivity: no usable output", {
        id: response.id,
        stop_reason: response.stop_reason,
        stop_details: response.stop_details,
      });
      return { ok: false, status: 500, message: MESSAGES.generic };
    }

    const problems = findProblems(activity);
    if (activity.type !== input.type || problems.length > 0) {
      console.error("generateActivity: activity failed checks", {
        id: response.id,
        expectedType: input.type,
        gotType: activity.type,
        problems,
      });
      return { ok: false, status: 500, message: MESSAGES.generic };
    }

    return { ok: true, activity };
  } catch (error) {
    const requestID = error instanceof Anthropic.APIError ? error.requestID : undefined;
    console.error("generateActivity failed:", error, requestID ? { requestID } : "");

    if (
      error instanceof Anthropic.AuthenticationError ||
      error instanceof Anthropic.PermissionDeniedError
    ) {
      return { ok: false, status: 502, message: MESSAGES.badKey };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, status: 429, message: MESSAGES.busy };
    }
    return { ok: false, status: 500, message: MESSAGES.generic };
  }
}
