import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/format";

/**
 * Placeholder catalogue until real products exist in Sanity — but the
 * images are real 3D mockups now (not the earlier single AI-generated
 * placeholder shared across every card), each showing an actual DJDN design.
 *
 * Sits on `bg-background-alt` — a deeper warm cream than the hero, one step
 * down from white rather than jumping straight to it. White is reserved for
 * the product cards themselves (`bg-surface`), matching the actual
 * photography (shot on white) — so the only white on this section is
 * honest white, not a whole section painted white by default.
 *
 * Desktop hover behaves like the filmstrip inspo: hovering a card grows its
 * share of the row (flex-grow, not a transform scale), which pushes its
 * neighbours aside to make room, and everything eases back on mouse-leave.
 * Tuned down further from the inspo's dramatic size jump (grow 1 -> 1.25).
 *
 * The "lift" is a contained zoom on the photo itself (scale-105, clipped by
 * the card's own overflow-hidden), not a translate on the outer card. An
 * earlier version moved the whole card up with -translate-y-1, which moved
 * its box-shadow along with it — and box-shadow is NOT clipped by an
 * element's own overflow-hidden (only its children are), so the shadow was
 * bleeding past the card's box into the section below with nothing to
 * contain it. Scaling the inner image instead means nothing the card paints
 * ever leaves its own fixed box.
 *
 * Product name is `truncate`d for the same underlying reason, a third time:
 * when a neighbour shrinks (because the hovered card grew), a name that no
 * longer fits its narrower column wraps onto a second line, which grows
 * that card's total height, which grows the row, which pushes the footer.
 * Fixed image height stopped the width->height leak for the photo; this
 * stops it for the text below it the same way, by never letting the text
 * wrap in the first place.
 * Grid stays a plain 2-up on mobile/tablet — there's no hover to drive the
 * effect below `lg`, so it isn't worth the flex-layout complexity there.
 *
 * The image height is fixed (`lg:h-[380px] lg:aspect-auto`) instead of
 * driven by `aspect-[4/5]` at that breakpoint — aspect-ratio computes height
 * from width, so growing width via flex-grow was growing height too, which
 * grew the row, which pushed the footer down and back up on every hover.
 * Fixing the height means flex-grow only ever changes width; the row's
 * total height never moves, so nothing below the section can shift.
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

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:flex lg:items-start lg:gap-5">
          {PRODUCTS.map((product) => (
            <Link
              key={product.name}
              href="/shop"
              className="group block lg:min-w-0 lg:flex-1 lg:transition-[flex-grow] lg:duration-500 lg:ease-out lg:hover:grow-[1.25]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface shadow-[0_1px_2px_rgba(28,25,23,0.06)] transition-shadow duration-500 group-hover:shadow-[0_20px_36px_-16px_rgba(28,25,23,0.22)] lg:aspect-auto lg:h-[380px]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 45vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
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
