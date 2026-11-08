import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { LogoutButton } from "./buttons";

export const metadata: Metadata = { title: "Dashboard · AI Learning Builder" };

type ActivityRow = {
  id: string;
  type: string;
  title: string;
  created_at: string;
};

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <p role="status" className="text-zinc-500 dark:text-zinc-400">
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
    .select("id, type, title, created_at")
    .eq("owner_id", claims.sub)
    .order("created_at", { ascending: false });
  const activities = (data ?? []) as ActivityRow[];

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm text-zinc-600 dark:text-zinc-400">{claims.email}</p>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight">Your activities</h1>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/activities/new"
            className="flex h-12 w-full items-center justify-center rounded-lg bg-zinc-900 text-base font-semibold text-white active:bg-zinc-700 sm:w-auto sm:px-6 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300"
          >
            New activity
          </Link>
        </div>

        <div className="mt-6">
          {error ? (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              Couldn&apos;t load your activities. Refresh the page to try again.
            </p>
          ) : activities.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No activities yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
                >
                  <p className="font-medium break-words">{activity.title}</p>
                  <p className="mt-1 flex flex-wrap gap-x-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="rounded bg-zinc-100 px-1.5 dark:bg-zinc-800">{activity.type}</span>
                    <time dateTime={activity.created_at}>
                      {dateFormat.format(new Date(activity.created_at))}
                    </time>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
