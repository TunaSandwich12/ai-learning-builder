// Decides where a request should be sent based on login state.
// Returns the path to redirect to, or null to let the request through.
export function authRedirect(pathname: string, signedIn: boolean): string | null {
  const isProtected = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isLogin = pathname === "/login";

  if (!signedIn && isProtected) return "/login";
  if (signedIn && isLogin) return "/dashboard";
  return null;
}
