import Link from "next/link";

import {
  COMING_SOON,
  type ComingSoonKey,
  type ComingSoonPage,
} from "@/lib/coming-soon";

import { BouncingLogos } from "./bouncing-logos";
import { NewsletterForm } from "./newsletter-form";

/**
 * Placeholder for pages that are linked but not built yet (about, contact,
 * policies and so on). No photography: a cream field with small DJDN logos
 * drifting and bouncing behind everything, and one centred column of content
 * in front. A soft cream wash sits behind the column so the logos pass
 * quietly underneath it instead of through the text. Content is set per page
 * in `lib/coming-soon.ts`.
 *
 * The text rises in with the same stagger as the hero. The form captures an
 * email for a launch note; like the footer's it has no provider behind it yet.
 */
const delay = (seconds: number) =>
  ({ "--d": `${seconds}s` }) as React.CSSProperties;

export function ComingSoon({ page: key }: { page: ComingSoonKey }) {
  const page: ComingSoonPage = COMING_SOON[key];

  return (
    <section className="relative isolate flex min-h-[calc(100svh-5rem)] items-center justify-center overflow-hidden bg-background px-4 py-20 sm:px-6 lg:px-8">
      <BouncingLogos className="-z-20" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_44rem_30rem_at_center,var(--color-background)_35%,transparent_100%)]"
      />

      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <p
          className="hero-rise flex items-center gap-2.5 font-sans text-xs text-ink-muted"
          style={delay(0)}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
          {page.section}
          <span aria-hidden="true">/</span>
          {page.eta ?? "In the works"}
        </p>

        <h1
          className="hero-rise mt-6 text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl"
          style={delay(0.07)}
        >
          <span className="block">{page.title}</span>
          <span className="block text-ink-muted">Coming soon.</span>
        </h1>

        <p
          className="hero-rise mt-6 max-w-md font-sans text-sm leading-relaxed text-ink-muted"
          style={delay(0.15)}
        >
          {page.description}
        </p>

        <div
          className="hero-rise mt-10 flex w-full max-w-md flex-col items-center"
          style={delay(0.23)}
        >
          <p className="mb-3 font-sans text-xs text-ink-muted">
            Get a note when it&rsquo;s live
          </p>
          <NewsletterForm
            id="coming-soon-email"
            buttonLabel="Notify me"
            doneMessage="Noted. We'll let you know."
            tone="light"
            className="w-full"
          />
        </div>

        <ul
          className="hero-rise mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 font-sans text-sm"
          style={delay(0.3)}
        >
          <li>
            <Link
              href="/shop"
              className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
            >
              Keep shopping
            </Link>
          </li>
          <li>
            <a
              href="https://instagram.com/djdn.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
            >
              @djdn.ng on Instagram
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
