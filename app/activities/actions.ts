"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { activityIdSchema } from "@/src/lib/load-activity";
import {
  DELETE_MESSAGES,
  SAVE_MESSAGES,
  validateSave,
  type DeleteResult,
  type SaveResult,
} from "@/src/lib/save-activity";

/**
 * Creates (id = null) or updates an activity for the logged-in teacher.
 * Uses the normal server client (anon key + the teacher's cookies), never a
 * secret key. owner_id is never sent: the column defaults to auth.uid() and
 * row-level security only lets a teacher insert or update their own rows.
 * Never throws; failures come back as a friendly message.
 */
export async function saveActivity(id: string | null, activity: unknown): Promise<SaveResult> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getClaims();
    // Not redirect(): that would throw away the activity that's still on screen.
    if (!auth?.claims) return { ok: false, message: SAVE_MESSAGES.signedOut };

    const checked = validateSave(id, activity);
    if (!checked.ok) {
      console.error("saveActivity: validation failed", { problems: checked.problems });
      return { ok: false, message: checked.message };
    }

    const { row } = checked;
    if (checked.id === null) {
      const { data, error } = await supabase.from("activities").insert(row).select("id").single();
      if (error || !data) {
        console.error("saveActivity: insert failed", error);
        return { ok: false, message: SAVE_MESSAGES.failed };
      }
      revalidatePath("/dashboard");
      return { ok: true, id: data.id as string };
    }

    const { data, error } = await supabase
      .from("activities")
      .update(row)
      .eq("id", checked.id)
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("saveActivity: update failed", error);
      return { ok: false, message: SAVE_MESSAGES.failed };
    }
    // No row back: it doesn't exist, or row-level security hides it (not ours).
    if (!data) return { ok: false, message: SAVE_MESSAGES.notFound };

    revalidatePath("/dashboard");
    return { ok: true, id: checked.id };
  } catch (error) {
    console.error("saveActivity failed:", error);
    return { ok: false, message: SAVE_MESSAGES.failed };
  }
}

/** Deletes one of the logged-in teacher's activities. Never throws. */
export async function deleteActivity(id: unknown): Promise<DeleteResult> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getClaims();
    if (!auth?.claims) return { ok: false, message: DELETE_MESSAGES.signedOut };

    const parsedId = activityIdSchema.safeParse(id);
    if (!parsedId.success) return { ok: false, message: DELETE_MESSAGES.notFound };

    // RLS only allows deleting your own rows; the owner_id filter makes it explicit.
    const { data, error } = await supabase
      .from("activities")
      .delete()
      .eq("id", parsedId.data)
      .eq("owner_id", auth.claims.sub)
      .select("id");
    if (error) {
      console.error("deleteActivity: delete failed", error);
      return { ok: false, message: DELETE_MESSAGES.failed };
    }
    if (!data || data.length === 0) return { ok: false, message: DELETE_MESSAGES.notFound };

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    console.error("deleteActivity failed:", error);
    return { ok: false, message: DELETE_MESSAGES.failed };
  }
}
