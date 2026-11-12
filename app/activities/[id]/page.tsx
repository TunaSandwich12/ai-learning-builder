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
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-muted">
          <li>
            <Link href="/dashboard" className="font-semibold text-tint-ink hover:underline hover:underline-offset-4">
              Your activities
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Edit activity</li>
        </ol>
      </nav>
      <h1 className="mt-3 mb-8 text-3xl font-bold sm:text-4xl">Edit activity</h1>

      <Suspense
        fallback={
          <p role="status" className="text-muted">
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
