// Turns a row loaded from the activities table into an Activity, or null if
// the teacher may not see it or its content isn't a valid activity.
// Plain logic (no Supabase) so it can be unit tested.
import { z } from "zod";
import { activitySchema, type Activity } from "@/src/lib/schemas";

export const activityIdSchema = z.uuid();

export type SavedRow = { id: string; owner_id: string; content: unknown };

export function parseSavedRow(row: SavedRow | null, userId: string): Activity | null {
  // RLS already hides other teachers' rows; this makes the rule explicit.
  if (!row || row.owner_id !== userId) return null;
  const parsed = activitySchema.safeParse(row.content);
  return parsed.success ? parsed.data : null;
}

/** Shown on /a/<id> for every failure, so the page never says why. */
export const UNAVAILABLE_MESSAGE = "This activity isn't available. Ask your teacher for a new link.";

/**
 * The public /a/<id> page selects only `content` (never owner_id or anything
 * about the teacher). Returns the activity, or null if missing or invalid.
 */
export function parseSharedRow(row: { content: unknown } | null): Activity | null {
  if (!row) return null;
  const parsed = activitySchema.safeParse(row.content);
  return parsed.success ? parsed.data : null;
}
