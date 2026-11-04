"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { credentialsSchema, type AuthState } from "@/src/lib/auth/schema";
import { createClient } from "@/src/lib/supabase/server";

// Handles both buttons on the login form. The clicked button sends
// intent=login or intent=signup.
export async function authenticate(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const intent = formData.get("intent") === "signup" ? "signup" : "login";
  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

  const parsed = credentialsSchema.safeParse({
    email: rawEmail,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your email and password.", email };
  }

  const supabase = await createClient();

  if (intent === "login") {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      if (error.status === 429) {
        return { error: "Too many attempts. Wait a minute and try again.", email };
      }
      if (error.code === "email_not_confirmed") {
        return { error: "Please confirm your email first. Check your inbox for the link.", email };
      }
      return { error: "Email or password is incorrect.", email };
    }
    redirect("/dashboard");
  }

  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/confirm` },
  });
  if (error) {
    if (error.status === 429) {
      return { error: "Too many attempts. Wait a minute and try again.", email };
    }
    if (error.code === "weak_password") {
      return { error: "That password is too easy to guess. Try a longer one.", email };
    }
    // Deliberately vague: don't reveal whether the email already has an account.
    return { error: "Couldn't create that account. If you already have one, try logging in.", email };
  }

  // No session means Supabase is waiting for the teacher to confirm their email.
  if (!data.session) {
    return { message: "Almost done! Check your email for a link to confirm your account.", email };
  }
  redirect("/dashboard");
}

async function siteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
