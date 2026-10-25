"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { Colourway, Product } from "@/lib/catalogue";
import { formatNaira } from "@/lib/format";

import { Settle } from "./settle";

export type ShopView = "product" | "look";

/** Bare-product shots sit whole on white; model photos fill and crop. */
function fit(src: string, colourway: Colourway) {
  return src === colourway.product ? "object-contain p-[3%]" : "object-cover";
}

/**
 * Listing tile: flush photo, then name, active colour and price, then colour
 * swatches. The `view` (product or look) decides which photo leads; the other
 * crossfades in on hover when the colourway has both. Hovering or focusing a
 * swatch switches the tile to that colourway. Swatches sit outside the link so
 * there are no nested interactive elements.
 */
export function ShopTile({
  product,
  view,
  sizes,
}: {
  product: Product;
  view: ShopView;
  sizes: string;
}) {
  const [active, setActive] = useState(0);
  const colourway = product.colourways[active];

  const primary =
    view === "look"
      ? (colourway.look ?? colourway.product)
      : (colourway.product ?? colourway.look);
  const secondary = view === "look" ? colourway.product : colourway.look;
  const hover = secondary && secondary !== primary ? secondary : undefined;

  return (
    <article className="group relative bg-surface">
      {product.isNew && (
        <span className="pointer-events-none absolute left-4 top-4 z-10 font-sans text-xs text-ink-muted sm:left-6 lg:left-8">
          New
        </span>
      )}

      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          <Settle>
            {primary && (
              <Image
                src={primary}
                alt={`${product.name}, ${colourway.name}`}
                fill
                sizes={sizes}
                className={fit(primary, colourway)}
              />
            )}
            {hover && (
              <div className="absolute inset-0 bg-surface opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
                <Image
                  src={hover}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes={sizes}
                  className={fit(hover, colourway)}
                />
              </div>
            )}
          </Settle>
        </div>

        <div className="px-4 pt-4 font-sans text-sm sm:px-6 lg:px-8">
          <p className="text-ink">
            {product.name}{" "}
            <span className="text-ink-muted">{colourway.name}</span>
          </p>
          <p className="mt-1 tabular-nums text-ink-muted">
            {formatNaira(product.price)}
          </p>
        </div>
      </Link>

      <div className="flex px-2 pb-3 pt-1 sm:px-4 lg:px-6">
        {product.colourways.map((c, index) => (
          <button
            key={c.name}
            type="button"
            aria-label={c.name}
            aria-pressed={index === active}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
            className="flex h-9 w-9 items-center justify-center"
          >
            <span
              style={{ backgroundColor: c.swatch }}
              className={`block h-3 w-3 rounded-full border border-ink/20 transition-shadow ${
                product.colourways.length > 1 && index === active
                  ? "ring-1 ring-ink ring-offset-2 ring-offset-surface"
                  : ""
              }`}
            />
          </button>
        ))}
      </div>
    </article>
  );
}
