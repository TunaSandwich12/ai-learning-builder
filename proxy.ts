import type { NextRequest } from "next/server";
import { updateSession } from "@/src/lib/supabase/proxy";

// Next.js 16 name for middleware. Keeps the Supabase login fresh and
// protects /dashboard.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on everything except static files and images.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
