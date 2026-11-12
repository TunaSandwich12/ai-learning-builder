import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { activityTypeLabel } from "@/src/lib/activity-types";
import { DeleteActivityButton } from "./buttons";

export const metadata: Metadata = { title: "Dashboard · AI Learning Builder" };

type ActivityRow = {
  id: string;
  type: string;
  title: string;
  updated_at: string;
  is_public: boolean;
};

const dateFormat = new Intl.DateTimeFormat("en-ZA", {
  dateStyle: "medium",
  timeZone: "Africa/Johannesburg",
});

// The page reads login cookies, so it can't be built ahead of time. Wrapping it
// in <Suspense> lets Next.js prerender the loading shell and stream the rest.
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard />
    </Suspense>
  );
}

function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <p role="status" className="text-muted">
        Loading…
      </p>
    </main>
  );
}

async function Dashboard() {
  const supabase = await createClient();

  // Backup check in case proxy.ts didn't run.
  const { data: auth } = await supabase.auth.getClaims();
  const claims = auth?.claims;
  if (!claims) redirect("/login");

  // RLS already limits this to the teacher's own rows; the owner_id filter
  // just makes that explicit.
  const { data, error } = await supabase
    .from("activities")
    .select("id, type, title, updated_at, is_public")
    .eq("owner_id", claims.sub)
    .order("updated_at", { ascending: false });
  const activities = (data ?? []) as ActivityRow[];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Your activities</h1>
          {!error && activities.length > 0 && (
            <p className="mt-1.5 text-muted">
              {activities.length === 1 ? "1 activity" : `${activities.length} activities`}, newest first.
            </p>
          )}
        </div>
        {activities.length > 0 && <NewActivityLink />}
      </div>

      <div className="mt-8">
        {error ? (
          <p role="alert" className="alert alert-bad">
            Couldn&apos;t load your activities. Refresh the page to try again.
          </p>
        ) : activities.length === 0 ? (
          <div className="card flex flex-col items-center gap-4 px-6 py-14 text-center">
            <h2 className="text-2xl">Make your first activity</h2>
            <p className="max-w-md text-muted">
              Choose a type, describe what you&apos;re teaching, and you&apos;ll get a draft to check
              and adjust before you share it with your class.
            </p>
            <NewActivityLink />
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <li key={activity.id} className="card flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tag">{activityTypeLabel(activity.type)}</span>
                  {activity.is_public && <span className="tag tag-good">Shared</span>}
                </div>
                <Link
                  href={`/activities/${activity.id}`}
                  className="rounded-lg text-lg leading-snug font-semibold break-words hover:text-tint-ink"
                >
                  {activity.title}
                </Link>
                <p className="mt-auto text-sm text-muted">
                  Edited{" "}
                  <time dateTime={activity.updated_at}>
                    {dateFormat.format(new Date(activity.updated_at))}
                  </time>
                </p>
                <div className="flex flex-wrap items-start gap-2 border-t border-rule pt-4">
                  <Link href={`/activities/${activity.id}`} className="btn btn-soft">
                    Open
                  </Link>
                  <DeleteActivityButton id={activity.id} title={activity.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function NewActivityLink() {
  return (
    <Link href="/activities/new" className="btn btn-primary self-start sm:self-auto">
      New activity
    </Link>
  );
}
