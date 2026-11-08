import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ActivityPlayer } from "@/components/player/ActivityPlayer";
import { activityIdSchema, parseSharedRow } from "@/src/lib/load-activity";
import { createClient } from "@/src/lib/supabase/server";

// Shared links shouldn't turn up in search engines.
export const metadata: Metadata = {
  title: "Activity · AI Learning Builder",
  robots: { index: false, follow: false },
};

// Public: no login needed (authRedirect doesn't protect /a). params and the
// database read are request data, so they're read inside <Suspense> and
// streamed after the static shell.
export default function SharedActivityPage({ params }: PageProps<"/a/[id]">) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <Suspense
        fallback={
          <p role="status" className="text-zinc-500 dark:text-zinc-400">
            Loading…
          </p>
        }
      >
        <SharedActivity params={params} />
      </Suspense>
    </main>
  );
}

async function SharedActivity({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!activityIdSchema.safeParse(id).success) notFound();

  const supabase = await createClient();
  // ONLY content. Never owner_id or anything else about the teacher.
  const { data, error } = await supabase
    .from("activities")
    .select("content")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();
  if (error) console.error("SharedActivity: load failed", error);

  const activity = parseSharedRow(data);
  if (!activity) notFound();

  return <ActivityPlayer activity={activity} />;
}
