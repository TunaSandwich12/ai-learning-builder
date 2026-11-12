import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ActivityPlayer } from "@/components/player/ActivityPlayer";
import { SiteHeader } from "@/components/ui/header";
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
    <div className="flex flex-1 flex-col">
      <SiteHeader href="/" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Suspense
          fallback={
            <p role="status" className="text-muted">
              Loading…
            </p>
          }
        >
          <SharedActivity params={params} />
        </Suspense>
      </main>
    </div>
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
