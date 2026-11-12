import { Suspense } from "react";
import { LogoutButton } from "@/app/dashboard/buttons";
import { createClient } from "@/src/lib/supabase/server";
import { SiteHeader } from "./header";

/** Header for the signed-in pages: wordmark, the teacher's email and Log out. */
export function TeacherHeader() {
  return (
    <SiteHeader href="/dashboard">
      {/* Reads the login cookies, so it streams in after the static shell. */}
      <Suspense fallback={null}>
        <Account />
      </Suspense>
    </SiteHeader>
  );
}

async function Account() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return null;
  const email = data.claims.email;

  return (
    <div className="flex min-w-0 items-center gap-4">
      {typeof email === "string" && (
        <span className="hidden max-w-64 truncate text-sm text-muted sm:block">{email}</span>
      )}
      <LogoutButton />
    </div>
  );
}
