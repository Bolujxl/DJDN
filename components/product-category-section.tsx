import Link from "next/link";

import { CATEGORY_LABELS, type Category } from "@/lib/catalogue";

import { ProductTile, type TileProduct } from "./product-tile";

/**
 * Editorial category spread. A header row at the page gutter (title and
 * subtitle left, "View all" right, same as New Arrivals) sits above two flush
 * columns of equal height: one lead photo, and the remaining products as
 * tiles. The lead stretches at `lg` to match the tile column exactly, so the
 * tops and bottoms of both rectangles line up. Three remaining tiles become
 * two squares plus one wide tile; two become two wide tiles, so the tile
 * column never ends on an empty cell. `reverse` flips which side the lead
 * sits on so consecutive categories don't repeat the same composition. The
 * title always stays on the left. White ground matches the product tiles.
 * "View all" opens the shop filtered to `category`, and says so to screen
 * readers, since several of these links share one page.
 */
export function ProductCategorySection({
  title,
  subtitle,
  category,
  products,
  reverse = false,
}: {
  title: string;
  subtitle: string;
  category: Category;
  products: TileProduct[];
  reverse?: boolean;
}) {
  const [lead, ...rest] = products;
  const allWide = rest.length === 2;
  const hasWide = rest.length % 2 === 1;
  const smallAspect = hasWide ? "aspect-square" : "aspect-[4/5]";

  return (
    <section className="bg-surface pt-16 lg:pt-24">
      <div className="flex items-end justify-between gap-6 px-4 pb-8 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
            {title}
          </h2>
          <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-ink-muted">
            {subtitle}
          </p>
        </div>
        <Link
          href={`/shop?type=${category}`}
          className="shrink-0 font-sans text-sm text-ink underline underline-offset-4 transition-colors hover:text-primary-hover"
        >
          View all
          <span className="sr-only"> {CATEGORY_LABELS[category].toLowerCase()}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-px bg-outline lg:grid-cols-2">
        <div className={`relative ${reverse ? "lg:order-2" : ""}`}>
          <ProductTile
            product={lead}
            sizes="(max-width: 1024px) 100vw, 50vw"
            aspect="aspect-[4/5]"
            stretch
          />
        </div>

        <div className="grid grid-cols-2 gap-px bg-outline">
          {rest.map((product, index) => {
            const isWide = allWide || (hasWide && index === rest.length - 1);
            return (
              <div key={product.name} className={isWide ? "col-span-2" : ""}>
                <ProductTile
                  product={product}
                  sizes={
                    isWide
                      ? "(max-width: 1024px) 100vw, 50vw"
                      : "(max-width: 1024px) 50vw, 25vw"
                  }
                  aspect={isWide ? "aspect-[2/1]" : smallAspect}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
