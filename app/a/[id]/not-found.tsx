import { UNAVAILABLE_MESSAGE } from "@/src/lib/load-activity";

// Shown for every reason a shared link doesn't work (bad link, not shared any
// more, deleted), so the page never reveals which.
export default function SharedActivityNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-lg font-medium">{UNAVAILABLE_MESSAGE}</p>
    </main>
  );
}
