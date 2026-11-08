import Link from "next/link";

import { BouncingLogos } from "./bouncing-logos";

/**
 * The 404 body: same cream field and drifting logos as the coming-soon pages,
 * so a dead link still feels like DJDN.
 */
export function NotFoundView() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-5rem)] items-center justify-center overflow-hidden bg-background px-4 py-20 sm:px-6 lg:px-8">
      <BouncingLogos className="-z-20" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_44rem_30rem_at_center,var(--color-background)_35%,transparent_100%)]"
      />
      <div className="flex max-w-xl flex-col items-center text-center">
        <p className="hero-rise font-sans text-xs text-ink-muted">404</p>
        <h1
          className="hero-rise mt-6 text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl"
          style={{ "--d": "0.07s" } as React.CSSProperties}
        >
          <span className="block">This page</span>
          <span className="block text-ink-muted">doesn&rsquo;t exist.</span>
        </h1>
        <p
          className="hero-rise mt-6 max-w-md font-sans text-sm leading-relaxed text-ink-muted"
          style={{ "--d": "0.15s" } as React.CSSProperties}
        >
          The link may be old, or the page may have moved.
        </p>
        <ul
          className="hero-rise mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 font-sans text-sm"
          style={{ "--d": "0.23s" } as React.CSSProperties}
        >
          <li>
            <Link
              href="/"
              className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
            >
              Back home
            </Link>
          </li>
          <li>
            <Link
              href="/shop"
              className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
            >
              Shop all
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
