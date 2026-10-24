import Link from "next/link";

import { ProductTile, type TileProduct } from "./product-tile";

/**
 * Editorial category spread: one large lead photo beside a title block and
 * the remaining products as flush tiles. The remaining tiles are composed so
 * the right column roughly matches the lead's height: three become two
 * squares plus one wide tile, two become two wide tiles. DOM order is
 * title, lead, tiles so on mobile the title leads the section; at `lg` the
 * grid placement puts the lead beside the title and tiles. `reverse` flips
 * the sides so consecutive categories don't repeat the same composition.
 * Top padding provides the cream seam between this and whatever precedes it.
 */
export function ProductCategorySection({
  title,
  subtitle,
  products,
  reverse = false,
}: {
  title: string;
  subtitle: string;
  products: TileProduct[];
  reverse?: boolean;
}) {
  const [lead, ...rest] = products;
  const allWide = rest.length === 2;
  const hasWide = rest.length % 2 === 1;
  const smallAspect = hasWide ? "aspect-square" : "aspect-[4/5]";

  const place = reverse
    ? { lead: "lg:col-start-2", side: "lg:col-start-1" }
    : { lead: "lg:col-start-1", side: "lg:col-start-2" };

  return (
    <section className="bg-background pt-16 lg:pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_1fr]">
        <div
          className={`px-4 pb-8 sm:px-6 lg:row-start-1 lg:px-8 lg:pb-10 ${place.side}`}
        >
          <h2 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
            {title}
          </h2>
          <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-ink-muted">
            {subtitle}
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block font-sans text-sm text-ink underline underline-offset-4 transition-colors hover:text-primary"
          >
            View all {title.toLowerCase()}
          </Link>
        </div>

        <div className={`lg:row-span-2 lg:row-start-1 ${place.lead}`}>
          <ProductTile
            product={lead}
            sizes="(max-width: 1024px) 100vw, 50vw"
            aspect="aspect-[4/5]"
          />
        </div>

        <div className={`grid grid-cols-2 lg:row-start-2 ${place.side}`}>
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
