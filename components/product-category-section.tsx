import Link from "next/link";

import { ProductTile, type TileProduct } from "./product-tile";

/**
 * Editorial category spread: one large lead photo beside a text block and the
 * remaining products as flush tiles. When the remaining count is odd, the last
 * tile runs wide so the grid never ends on an empty cell. `reverse` flips the
 * sides so consecutive categories don't repeat the same composition.
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
  const hasWide = rest.length % 2 === 1;
  const smallAspect = hasWide ? "aspect-square" : "aspect-[4/5]";

  return (
    <section className="bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className={reverse ? "lg:order-2" : ""}>
          <ProductTile
            product={lead}
            sizes="(max-width: 1024px) 100vw, 50vw"
            aspect="aspect-[4/5]"
          />
        </div>

        <div
          className={`flex flex-col justify-between ${
            reverse ? "lg:order-1" : ""
          }`}
        >
          <div className="px-4 pb-10 pt-12 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-2">
            {rest.map((product, index) => {
              const isWide = hasWide && index === rest.length - 1;
              return (
                <div key={product.name} className={isWide ? "col-span-2" : ""}>
                  <ProductTile
                    product={product}
                    sizes={isWide ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                    aspect={isWide ? "aspect-[2/1]" : smallAspect}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
