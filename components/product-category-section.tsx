import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/format";

export type CategoryProduct = {
  name: string;
  price: number;
  image: string;
};

/**
 * Shared grid for the homepage's per-category sections (Shirts, Shorts, ...).
 * Deliberately reuses New Arrivals' settled-on pattern — plain static grid,
 * small lift + shadow on hover — rather than the flex-grow push/expand
 * interaction that section went through and dropped. That one cost real
 * debugging for a result that ended up undermining the section; no reason
 * to reintroduce it here.
 */
export function ProductCategorySection({
  title,
  subtitle,
  products,
  background = "bg-background",
}: {
  title: string;
  subtitle: string;
  products: CategoryProduct[];
  background?: "bg-background" | "bg-background-alt";
}) {
  return (
    <section className={`border-t border-outline ${background}`}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">{title}</h2>
        <p className="mt-2 font-sans text-sm text-ink-muted">{subtitle}</p>

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product) => (
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
