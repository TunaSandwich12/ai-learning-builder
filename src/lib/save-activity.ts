// Validation for saving an activity. Plain logic (no Supabase, no server-only
// imports) so it can be unit tested. Used by app/activities/actions.ts.
import { z } from "zod";
import { checkActivity } from "@/src/lib/checks";
import { activitySchema, type Activity, type ActivityType } from "@/src/lib/schemas";

export const SAVE_MESSAGES = {
  signedOut: "You've been signed out. Sign in again in another tab, then press Save.",
  badId: "This activity's link looks wrong. Go back to the dashboard and try again.",
  invalid: "This activity has a problem and can't be saved. Try refining it, then save again.",
  notFound: "Couldn't find this activity to update. It may have been deleted.",
  failed: "Couldn't save. Check your connection and try again.",
} as const;

/** The only columns the browser's data can reach. owner_id is never included. */
export type ActivityRow = { type: ActivityType; title: string; content: Activity };

export const DELETE_MESSAGES = {
  signedOut: "You've been signed out. Sign in again, then try again.",
  notFound: "Couldn't find this activity. It may already be deleted.",
  failed: "Couldn't delete. Check your connection and try again.",
} as const;

export type DeleteResult = { ok: true } | { ok: false; message: string };

export type SaveResult = { ok: true; id: string } | { ok: false; message: string };

export type ValidatedSave =
  | { ok: true; id: string | null; row: ActivityRow }
  | { ok: false; message: string; problems?: string[] };

const idSchema = z.union([z.null(), z.uuid()]);

export function validateSave(id: unknown, activity: unknown): ValidatedSave {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: SAVE_MESSAGES.badId };

  // Zod drops unknown keys, so anything extra the browser sends (owner_id, id…) is gone.
  const parsed = activitySchema.safeParse(activity);
  if (!parsed.success) {
    return {
      ok: false,
      message: SAVE_MESSAGES.invalid,
      problems: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  }

  const problems = checkActivity(parsed.data);
  if (problems.length > 0) return { ok: false, message: SAVE_MESSAGES.invalid, problems };

  const content = parsed.data;
  return {
    ok: true,
    id: parsedId.data,
    row: { type: content.type, title: content.title.trim(), content },
  };
}
