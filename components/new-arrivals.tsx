import Link from "next/link";

import { ProductTile, type TileProduct } from "./product-tile";

/**
 * Placeholder catalogue until real products exist in Sanity. Flush, full-bleed
 * 4-up tiles with no gaps (Rains / about:blank reference): the grid itself is
 * the structure, so there are no cards or section borders. Product photos are
 * shot on white, so the section sits on white and the tiles read as one
 * continuous wall of photography.
 */
const PRODUCTS: TileProduct[] = [
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
    hoverImage: "/brand/lookbook/shirt-weekend-popover-cream.jpg",
  },
];

export function NewArrivals() {
  return (
    <section className="bg-surface pb-16 lg:pb-24">
      <div className="flex items-end justify-between px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <h2 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
          New arrivals
        </h2>
        <Link
          href="/shop"
          className="font-sans text-sm text-ink underline underline-offset-4 transition-colors hover:text-primary"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((product) => (
          <ProductTile
            key={product.name}
            product={product}
            sizes="(max-width: 1024px) 50vw, 25vw"
          />
        ))}
      </div>
    </section>
  );
}
