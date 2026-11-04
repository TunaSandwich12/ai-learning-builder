"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export type AddActivityState = { error?: string };

// TEMP: lets you check that inserts and the list work. Remove once real
// activity creation exists.
export async function addTestActivity(): Promise<AddActivityState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  // owner_id is filled in by the database (default auth.uid()), and RLS
  // rejects any row that isn't the logged-in teacher's.
  const { error } = await supabase.from("activities").insert({ type: "test", title: "Test activity" });
  if (error) return { error: "Couldn't add the test activity. Try again." };

  revalidatePath("/dashboard");
  return {};
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
