import Image from "next/image";
import Link from "next/link";

import { Settle } from "./settle";

/**
 * Full-bleed break between the New Arrivals grid and the per-category
 * sections (Shirts/Shorts/Hoodies) — a deliberate transition moment rather
 * than sections just butting against each other, per the brief's "maybe a
 * dark section break" note. Real campaign photography (not a mockup),
 * dark scrim only strong enough to keep the text legible.
 */
export function LookbookBanner() {
  return (
    <section className="relative aspect-[4/5] w-full overflow-hidden bg-ink sm:aspect-[16/9] sm:max-h-[760px]">
      <Settle>
        <Image
          src="/brand/lookbook/banner-dynamic-crouch.jpg"
          alt="DJDN model in the Weekend Popover and khaki cargo shorts"
          fill
          sizes="100vw"
          className="object-cover object-top"
          priority={false}
        />
      </Settle>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

      <div className="relative flex h-full flex-col justify-end px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <h2 className="max-w-3xl text-5xl leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl">
          The full look, from this shot.
        </h2>
        <div className="mt-6">
          <Link
            href="/shop"
            className="inline-block rounded-[18px] border border-white px-7 py-3 font-sans text-sm text-white transition-colors hover:border-primary hover:bg-primary active:scale-[0.98]"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
