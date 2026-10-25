import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/format";

export type TileProduct = {
  name: string;
  price: number;
  image: string;
};

/**
 * Flush product tile: photo, then name with the price beneath it. No card,
 * radius or shadow; the photo is the object. The text inset uses the page
 * gutter so the first tile's caption lines up with the section heading above
 * it, and stacking name over price means a long name wraps instead of
 * truncating at narrow widths. Hover is a slow zoom of the photo inside its
 * own clipped box, so nothing ever changes size or shifts layout; keyboard
 * focus gets the same treatment.
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
  /** At `lg`, fill the parent's height instead of holding the aspect ratio. */
  stretch?: boolean;
}) {
  return (
    <Link
      href="/shop"
      className={`group block ${stretch ? "lg:flex lg:h-full lg:flex-col" : ""}`}
    >
      <div
        className={`relative overflow-hidden bg-surface ${aspect} ${
          stretch ? "lg:aspect-auto lg:min-h-0 lg:flex-1" : ""
        }`}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
      <div className="px-4 py-4 font-sans text-sm sm:px-6 lg:px-8">
        <p className="text-ink">{product.name}</p>
        <p className="mt-1 text-ink-muted">{formatNaira(product.price)}</p>
      </div>
    </Link>
  );
}
