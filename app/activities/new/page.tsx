import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { ActivityForm } from "../ActivityForm";

export const metadata: Metadata = { title: "New activity · AI Learning Builder" };

// Reads login cookies, so (like the dashboard) the auth check is wrapped in
// <Suspense> and streamed after the static shell.
export default function NewActivityPage() {
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
          <li aria-current="page">New activity</li>
        </ol>
      </nav>
      <h1 className="mt-3 mb-8 text-3xl font-bold sm:text-4xl">New activity</h1>

      <Suspense
        fallback={
          <p role="status" className="text-muted">
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

  return <ActivityForm />;
}
