import { activitySchema, type Activity } from "./schemas";

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
