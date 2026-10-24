import Image from "next/image";
import Link from "next/link";

/**
 * Editorial hero: huge tight type on the left, two equal-height colour
 * portraits flush side by side on the right. A cream-to-transparent gradient
 * runs down the left edge of the photos, so the headline side dissolves into
 * the imagery instead of meeting it at a hard edge. Each portrait keeps a
 * small label over a bottom scrim; the first label is indented past the
 * gradient so it never sits on the cream. Static on purpose, so this stays a
 * server component with no JS.
 */
const LABEL =
  "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink/60 to-transparent px-3 pb-3 pt-10 font-sans text-xs text-white sm:px-4 sm:pb-4";

export function Hero() {
  return (
    <section className="grid min-h-[calc(100svh-5rem)] grid-cols-1 bg-background text-ink lg:grid-cols-12">
      <div className="flex flex-col justify-end px-4 py-10 sm:px-6 lg:col-span-5 lg:px-8 lg:py-12">
        <div>
          <h1 className="text-[length:clamp(3.25rem,6.2vw,6.25rem)] leading-[0.92] tracking-[-0.05em] text-ink">
            Dress like you mean it.
          </h1>
          <p className="mt-8 max-w-xs font-sans text-sm leading-relaxed text-ink-muted">
            Sophisticated clothing for men and women, made to move.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-[18px] border border-ink px-7 py-3 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98]"
          >
            Shop Now
          </Link>
        </div>
      </div>

      <div className="relative grid h-[28rem] grid-cols-2 sm:h-[34rem] lg:col-span-7 lg:h-auto">
        <figure className="relative">
          <Image
            src="/brand/models/bw-crochet-sunflower.jpg"
            alt="Model in a black DJDN boxy tee and mesh shorts, holding a crochet sunflower"
            fill
            sizes="(max-width: 1024px) 50vw, 29vw"
            className="object-cover"
            priority
          />
          <figcaption className={`${LABEL}`}>
            Boxy tee &amp; mesh shorts
          </figcaption>
        </figure>

        <figure className="relative">
          <Image
            src="/brand/models/striped-shirt-sunflower-bouquet.jpg"
            alt="Model wearing the DJDN weekend shirt in pistachio stripe"
            fill
            sizes="(max-width: 1024px) 50vw, 29vw"
            className="object-cover"
          />
          <figcaption className={LABEL}>
            The weekend shirt, pistachio stripe
          </figcaption>
        </figure>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[8%] bg-gradient-to-r from-background/70 to-transparent"
        />
      </div>
    </section>
  );
}
