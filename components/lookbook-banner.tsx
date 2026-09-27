import Image from "next/image";
import Link from "next/link";

/**
 * Full-bleed break between the New Arrivals grid and the per-category
 * sections (Shirts/Shorts/Hoodies) — a deliberate transition moment rather
 * than sections just butting against each other, per the brief's "maybe a
 * dark section break" note. Real campaign photography (not a mockup),
 * dark scrim only strong enough to keep the text legible.
 */
export function LookbookBanner() {
  return (
    <section className="relative h-[520px] overflow-hidden bg-ink sm:h-[600px]">
      <Image
        src="/brand/lookbook/banner-dynamic-crouch.jpg"
        alt="DJDN model in the Weekend Popover and khaki cargo shorts"
        fill
        sizes="100vw"
        className="object-cover object-top"
        priority={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

      <div className="relative flex h-full max-w-7xl flex-col justify-end px-4 pb-14 mx-auto sm:px-6 lg:px-8">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-on-secondary-muted">
          The Lookbook
        </p>
        <h2 className="mt-3 max-w-md font-display text-3xl text-on-secondary sm:text-4xl">
          Considered, not chased.
        </h2>
        <div className="mt-7">
          <Link
            href="/shop"
            className="inline-block rounded-[18px] bg-primary px-7 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
