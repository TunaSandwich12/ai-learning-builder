// Decides where a request should be sent based on login state.
// Returns the path to redirect to, or null to let the request through.
// True for `base` itself and anything under it, but not look-alikes
// (e.g. "/activities" matches "/activities/new" but not "/activitiesx" or "/a/...").
const isUnder = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(base + "/");

export function authRedirect(pathname: string, signedIn: boolean): string | null {
  const isProtected = isUnder(pathname, "/dashboard") || isUnder(pathname, "/activities");
  const isLogin = pathname === "/login";

  if (!signedIn && isProtected) return "/login";
  if (signedIn && isLogin) return "/dashboard";
  return null;
}
