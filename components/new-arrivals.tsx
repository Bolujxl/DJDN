import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/format";

/**
 * Placeholder catalogue until real products exist in Sanity. Every entry
 * shares the one product photo we have — an AI-generated ghost-mannequin
 * shot, kept as the default/fallback image — until a third party delivers
 * real 3D product mockups. Swap `image` per product as those arrive; the
 * card layout doesn't need to change.
 *
 * Sits on `bg-surface` (white) with a hairline top border, one step up from
 * the hero's cream — a deliberate plane shift so sections read as distinct
 * without needing a color block or a hard divider to announce it.
 *
 * No "New" tag on these cards — the section is already titled New Arrivals,
 * so tagging every card "New" too just repeats the section header. NewTag
 * (components/new-tag.tsx) is kept for the future Shop/PLP grid, where
 * products are mixed old and new and the tag actually carries information —
 * restyled to a flat pill/rectangle there, not this hanging-tag shape.
 */
const DEFAULT_IMAGE = "/brand/products/djdn-tee-black.jpg";

const PRODUCTS = [
  { name: "Oval Logo Tee — Black", price: 2800000, image: DEFAULT_IMAGE },
  { name: "Sunflower Graphic Tee", price: 3200000, image: DEFAULT_IMAGE },
  { name: "Signature Trucker Cap", price: 1850000, image: DEFAULT_IMAGE },
  { name: "Ribbed Beanie", price: 1500000, image: DEFAULT_IMAGE },
];

export function NewArrivals() {
  return (
    <section className="border-t border-outline bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">
          New Arrivals
        </h2>
        <p className="mt-2 font-sans text-sm text-ink-muted">Just dropped.</p>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {PRODUCTS.map((product) => (
            <Link key={product.name} href="/shop" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-outline">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 45vw, 300px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-4 font-display text-base text-ink">
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
