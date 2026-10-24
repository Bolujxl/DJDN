import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/format";

export type TileProduct = {
  name: string;
  price: number;
  image: string;
};

/**
 * Flush product tile: photo, then name left / price right on one line. No
 * card, radius or shadow; the photo is the object. Hover is a slow zoom of
 * the photo inside its own clipped box, so nothing ever changes size or
 * shifts layout. Keyboard focus gets the same treatment as hover.
 */
export function ProductTile({
  product,
  sizes,
  aspect = "aspect-[4/5]",
}: {
  product: TileProduct;
  sizes: string;
  aspect?: string;
}) {
  return (
    <Link href="/shop" className="group block">
      <div className={`relative overflow-hidden bg-surface ${aspect}`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
      <div className="flex items-baseline justify-between gap-3 px-3 py-3 font-sans text-sm">
        <p className="truncate text-ink">{product.name}</p>
        <p className="shrink-0 text-ink-muted">{formatNaira(product.price)}</p>
      </div>
    </Link>
  );
}
