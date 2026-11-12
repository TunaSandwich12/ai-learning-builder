import Link from "next/link";
import type { ReactNode } from "react";

/** The product name with a small blue app mark. */
export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-on-primary">
          <path d="M5 6.5h14M5 12h10M5 17.5h6" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-[1.0625rem] font-semibold tracking-tight">AI Learning Builder</span>
    </span>
  );
}

/** The white bar across the top of every page. */
export function SiteHeader({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-surface">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link href={href} className="-mx-1 rounded-lg px-1 py-1">
          <Wordmark />
        </Link>
        {children}
      </div>
    </header>
  );
}
