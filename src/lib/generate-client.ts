import { activitySchema, type Activity, type ActivityType } from "./schemas";
import { MAX_HISTORY } from "./schemas/generate-request";

export type ChatMessage = { role: "teacher" | "assistant"; text: string };

/** Body for a refine request: the new message, the last few chat messages, and the current activity. */
export function buildRefineBody(
  type: ActivityType,
  request: string,
  messages: ChatMessage[],
  current: Activity,
) {
  return {
    type,
    request,
    history: messages.slice(-MAX_HISTORY).map(({ role, text }) => ({ role, text })),
    current,
  };
}

export type GenerateResult =
  | { ok: true; activity: Activity }
  | { ok: false; message: string };

export const FALLBACK_ERROR = "Something went wrong. Please try again.";

/**
 * Turns a /api/generate response into either a checked activity or one
 * friendly sentence for the teacher. Never throws.
 */
export async function readGenerateResponse(res: Response): Promise<GenerateResult> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { ok: false, message: FALLBACK_ERROR };
  }

  if (!res.ok) {
    const error = (body as { error?: unknown } | null)?.error;
    const message = typeof error === "string" && error.trim() ? error : FALLBACK_ERROR;
    return { ok: false, message };
  }

  const parsed = activitySchema.safeParse((body as { content?: unknown } | null)?.content);
  if (!parsed.success) {
    return { ok: false, message: FALLBACK_ERROR };
  }
  return { ok: true, activity: parsed.data };
}
