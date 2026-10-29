"use client";

import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/format";

import { findProduct, lineKey, useCart } from "./cart-provider";

/**
 * Cart page. Lists what has been added, lets quantities change, and shows a
 * subtotal. Checkout is not built yet, so the button is honest about that
 * rather than pretending to go somewhere.
 */
export function CartView() {
  const { items, setQty, remove } = useCart();

  const lines = items.flatMap((item) => {
    const product = findProduct(item.slug);
    if (!product) return [];
    const colourway =
      product.colourways.find((c) => c.name === item.colour) ??
      product.colourways[0];
    return [{ item, product, colourway }];
  });
  const subtotal = lines.reduce(
    (total, line) => total + line.product.price * line.item.qty,
    0,
  );

  return (
    <section className="bg-surface px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        Cart
      </h1>

      {lines.length === 0 ? (
        <p className="mt-8 font-sans text-sm text-ink-muted">
          Your cart is empty.{" "}
          <Link
            href="/shop"
            className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
          >
            Keep shopping
          </Link>
        </p>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <ul className="border-t border-outline lg:col-span-8">
            {lines.map(({ item, product, colourway }) => {
              const thumb = colourway.look ?? colourway.product;
              const key = lineKey(item);
              return (
                <li
                  key={key}
                  className="flex gap-5 border-b border-outline py-6"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative h-32 w-24 shrink-0 overflow-hidden bg-background"
                  >
                    {thumb && (
                      <Image
                        src={thumb}
                        alt={product.name}
                        fill
                        sizes="96px"
                        className={
                          thumb === colourway.product
                            ? "object-contain p-[3%]"
                            : "object-cover"
                        }
                      />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col justify-between font-sans text-sm">
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <p className="text-ink">{product.name}</p>
                        <p className="mt-1 text-ink-muted">
                          {item.colour}, size {item.size}
                        </p>
                      </div>
                      <p className="tabular-nums text-ink">
                        {formatNaira(product.price * item.qty)}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center border border-outline">
                        <button
                          type="button"
                          aria-label={`Fewer ${product.name}`}
                          onClick={() => setQty(key, item.qty - 1)}
                          className="h-10 w-10 text-ink transition-colors hover:bg-background"
                        >
                          -
                        </button>
                        <span className="w-8 text-center tabular-nums text-ink">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`More ${product.name}`}
                          onClick={() => setQty(key, item.qty + 1)}
                          className="h-10 w-10 text-ink transition-colors hover:bg-background"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(key)}
                        className="text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="font-sans text-sm lg:col-span-4">
            <div className="flex items-baseline justify-between border-t border-outline pt-6">
              <p className="text-ink">Subtotal</p>
              <p className="tabular-nums text-ink">{formatNaira(subtotal)}</p>
            </div>
            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-[18px] border border-outline px-7 py-3.5 text-ink-muted"
            >
              Checkout coming soon
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
