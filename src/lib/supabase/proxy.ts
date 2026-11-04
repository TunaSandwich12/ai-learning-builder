import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authRedirect } from "@/src/lib/auth/redirect";
import { supabaseEnv } from "./env";

// Runs before every page (called from /proxy.ts). Refreshes the login token
// if needed, and sends people to the right page for their login state.
export async function updateSession(request: NextRequest) {
  const { url, anonKey } = supabaseEnv();
  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Update the request so the page sees the new token...
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        // ...and the response so the browser stores it.
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        // Stops CDNs from caching one teacher's session for another.
        cacheHeaders = { ...cacheHeaders, ...headers };
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Must run before anything else: verifies the token and refreshes it if needed.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const target = authRedirect(request.nextUrl.pathname, signedIn);
  if (!target) return response;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = target;
  redirectUrl.search = "";
  const redirect = NextResponse.redirect(redirectUrl);
  // Keep any refreshed cookies and no-cache headers on the redirect.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  Object.entries(cacheHeaders).forEach(([key, value]) => redirect.headers.set(key, value));
  return redirect;
}
