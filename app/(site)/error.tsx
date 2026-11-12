"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Shown when a page throws while rendering. The header and footer stay; only this section is replaced. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // The page itself says nothing about what broke, so keep the cause in the
  // browser console where it can be read off a phone or a bug report.
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[60svh] flex-col items-center justify-center bg-background px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        Something went wrong.
      </h1>
      <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
        That wasn&rsquo;t meant to happen. Try again, or head back to the shop.
      </p>
      <div className="mt-10 flex items-center gap-6 font-sans text-sm">
        <button
          type="button"
          onClick={reset}
          className="rounded-[18px] border border-ink px-7 py-3.5 text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98]"
        >
          Try again
        </button>
        <Link
          href="/shop"
          className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
        >
          Back to shop
        </Link>
      </div>
    </section>
  );
}
