import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { NewActivityForm } from "./NewActivityForm";

export const metadata: Metadata = { title: "New activity · AI Learning Builder" };

// Reads login cookies, so (like the dashboard) the auth check is wrapped in
// <Suspense> and streamed after the static shell.
export default function NewActivityPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <Link
        href="/dashboard"
        className="inline-flex h-11 items-center text-sm font-medium text-zinc-600 dark:text-zinc-400"
      >
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-bold tracking-tight">New activity</h1>

      <Suspense
        fallback={
          <p role="status" className="text-zinc-500 dark:text-zinc-400">
            Loading…
          </p>
        }
      >
        <SignedInForm />
      </Suspense>
    </main>
  );
}

async function SignedInForm() {
  // Backup check in case proxy.ts didn't run.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  return <NewActivityForm />;
}
