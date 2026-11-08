import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { activityIdSchema, parseSavedRow, type SavedRow } from "@/src/lib/load-activity";
import { createClient } from "@/src/lib/supabase/server";
import { ActivityForm } from "../ActivityForm";

export const metadata: Metadata = { title: "Edit activity · AI Learning Builder" };

// params and the login cookies are request data, so (like /activities/new)
// they're read inside <Suspense> and streamed after the static shell.
export default function EditActivityPage({ params }: PageProps<"/activities/[id]">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <Link
        href="/dashboard"
        className="inline-flex h-11 items-center text-sm font-medium text-zinc-600 dark:text-zinc-400"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold tracking-tight">Edit activity</h1>

      <Suspense
        fallback={
          <p role="status" className="text-zinc-500 dark:text-zinc-400">
            Loading…
          </p>
        }
      >
        <EditActivity params={params} />
      </Suspense>
    </main>
  );
}

async function EditActivity({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Not a UUID: don't even ask the database (it would error, not return nothing).
  if (!activityIdSchema.safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/login");

  const { data, error } = await supabase
    .from("activities")
    .select("id, owner_id, content, is_public")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("EditActivity: load failed", error);

  const row = data as (SavedRow & { is_public: boolean }) | null;
  const activity = parseSavedRow(row, auth.claims.sub);
  if (!row || !activity) notFound();

  return <ActivityForm initial={{ id, activity, isPublic: row.is_public === true }} />;
}
