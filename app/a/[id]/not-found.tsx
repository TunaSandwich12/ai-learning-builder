import { SiteHeader } from "@/components/ui/header";
import { UNAVAILABLE_MESSAGE } from "@/src/lib/load-activity";

// Shown for every reason a shared link doesn't work (bad link, not shared any
// more, deleted), so the page never reveals which.
export default function SharedActivityNotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader href="/" />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16">
        <div className="card px-6 py-10 text-center sm:px-10">
          <h1 className="text-2xl">This link doesn&apos;t work</h1>
          <p className="mt-3 text-muted">{UNAVAILABLE_MESSAGE}</p>
        </div>
      </main>
    </div>
  );
}
