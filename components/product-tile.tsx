import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/format";

import { Settle } from "./settle";

export type TileProduct = {
  /** Where the tile links; defaults to the shop. */
  href?: string;
  name: string;
  price: number;
  image: string;
  /** Optional second photo (model <-> bare product); crossfades in on hover or focus. */
  hoverImage?: string;
  /**
   * How the hover photo sits in the tile. "contain" shows the whole photo on
   * white (right for bare-product shots, which would otherwise be cropped);
   * "cover" fills and crops (right for model photos). Defaults to "cover".
   */
  hoverFit?: "cover" | "contain";
};

/**
 * Flush product tile: photo, then name with the price beneath it. No card,
 * radius or shadow; the photo is the object. The text inset uses the page
 * gutter so the first tile's caption lines up with the section heading above
 * it, and stacking name over price means a long name wraps instead of
 * truncating at narrow widths. Hover is a slow zoom of the photo inside its
 * own clipped box, or, when the product has a `hoverImage`, a crossfade to
 * that second photo instead (no zoom, so there's only one motion). Nothing
 * ever changes size or shifts layout; keyboard focus gets the same treatment.
 */
export function ProductTile({
  product,
  sizes,
  aspect = "aspect-[4/5]",
  stretch = false,
}: {
  product: TileProduct;
  sizes: string;
  aspect?: string;
  /**
   * At `lg`, fill the nearest positioned ancestor exactly (absolute inset-0)
   * instead of holding the aspect ratio. The tile then adds nothing to its
   * parent's height, so a neighbouring column alone decides the row height
   * and the two can never differ.
   */
  stretch?: boolean;
}) {
  return (
    <Link
      href={product.href ?? "/shop"}
      className={`group block bg-surface ${
        stretch ? "lg:absolute lg:inset-0 lg:flex lg:flex-col" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-surface ${aspect} ${
          stretch ? "lg:aspect-auto lg:min-h-0 lg:flex-1" : ""
        }`}
      >
        <Settle>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes={sizes}
            className={`object-cover ${
              product.hoverImage
                ? ""
                : "transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none"
            }`}
          />
          {product.hoverImage && (
            <div className="absolute inset-0 bg-surface opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
              <Image
                src={product.hoverImage}
                alt=""
                aria-hidden="true"
                fill
                sizes={sizes}
                className={
                  product.hoverFit === "contain"
                    ? "object-contain p-[3%]"
                    : "object-cover"
                }
              />
            </div>
          )}
        </Settle>
      </div>
      <div className="px-4 py-4 font-sans text-sm sm:px-6 lg:px-8">
        <p className="text-ink">{product.name}</p>
        <p className="mt-1 tabular-nums text-ink-muted">
          {formatNaira(product.price)}
        </p>
      </div>
    </Link>
  );
}
