import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/format";

/**
 * Placeholder catalogue until real products exist in Sanity — but the
 * images are real 3D mockups (not the earlier single AI-generated
 * placeholder shared across every card), each showing an actual DJDN design.
 *
 * Sits on `bg-background-alt` — a deeper warm cream than the hero, one step
 * down from white rather than jumping straight to it. White is reserved for
 * the product cards themselves (`bg-surface`), matching the actual
 * photography (shot on white) — so the only white on this section is
 * honest white, not a whole section painted white by default.
 *
 * Plain, static 4-up grid — an earlier version made hovered cards grow via
 * flex-grow (pushing neighbours aside, filmstrip-inspo style). Pulled after
 * seeing it live: it cost a real amount of debugging (three separate
 * instances of a card's width change leaking into a height change, which
 * leaked into the row's height, which pushed the footer) for an effect that
 * ended up undermining the section rather than helping it. Hover here is
 * now just a small lift + deepened shadow — safe by construction, since no
 * card's width or height ever changes, so there's no row-height feedback
 * loop left for a hover to trigger in the first place.
 *
 * `truncate` on the name is a leftover safety net (harmless, costs nothing)
 * rather than a fix for anything active now that column widths are fixed.
 *
 * No "New" tag on these cards — the section is already titled New Arrivals,
 * so tagging every card "New" too just repeats the section header. NewTag
 * (components/new-tag.tsx) is kept for the future Shop/PLP grid, where
 * products are mixed old and new and the tag actually carries information —
 * restyled to a flat pill/rectangle there, not this hanging-tag shape.
 */
const PRODUCTS = [
  {
    name: "Track Jacket — Bottle Green",
    price: 5200000,
    image: "/brand/products/green-track-jacket.jpg",
  },
  {
    name: "Swirl Jersey — Green",
    price: 3400000,
    image: "/brand/products/swirl-jersey-green.jpg",
  },
  {
    name: "Floral Wordmark Tank",
    price: 2400000,
    image: "/brand/products/floral-wordmark-tank.jpg",
  },
  {
    name: "Linen Popover Shirt — Cream",
    price: 3800000,
    image: "/brand/products/linen-popover-cream.jpg",
  },
];

export function NewArrivals() {
  return (
    <section className="border-t border-outline bg-background-alt">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">
          New Arrivals
        </h2>
        <p className="mt-2 font-sans text-sm text-ink-muted">Just dropped.</p>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {PRODUCTS.map((product) => (
            <Link key={product.name} href="/shop" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface shadow-[0_1px_2px_rgba(28,25,23,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_20px_-10px_rgba(28,25,23,0.2)]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 45vw, 320px"
                  className="object-cover"
                />
              </div>
              <p className="mt-4 truncate font-display text-base text-ink">
                {product.name}
              </p>
              <p className="mt-1 font-sans text-sm text-ink-muted">
                {formatNaira(product.price)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
