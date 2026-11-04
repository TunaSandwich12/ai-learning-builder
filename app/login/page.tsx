import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in · AI Learning Builder" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight">AI Learning Builder</h1>
        <p className="mt-1 mb-8 text-zinc-600 dark:text-zinc-400">
          Log in, or create a teacher account.
        </p>

        {error === "confirm" && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            That confirmation link didn&apos;t work or has expired. Try logging in, or sign up again.
          </p>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
