import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/ui/header";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in · AI Learning Builder" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader href="/" />

      <main className="flex flex-1 items-start justify-center px-4 py-12 sm:items-center sm:py-16">
        <div className="card w-full max-w-md px-6 py-8 sm:px-10 sm:py-10">
          <h1 className="text-3xl font-bold">Log in</h1>
          <p className="mt-2 mb-8 text-muted">
            Use your teacher account, or create one with your email.
          </p>

          <Suspense fallback={null}>
            <ConfirmError searchParams={searchParams} />
          </Suspense>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}

// Reads the URL, so it sits inside <Suspense>; the rest of the page is prerendered.
async function ConfirmError({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { error } = await searchParams;
  if (error !== "confirm") return null;

  return (
    <p role="alert" className="alert alert-bad mb-6">
      That confirmation link didn&apos;t work or has expired. Try logging in, or sign up again.
    </p>
  );
}
