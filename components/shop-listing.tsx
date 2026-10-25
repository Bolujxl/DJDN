"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CATEGORY_LABELS, type Category, type Product } from "@/lib/catalogue";

import { ShopTile, type ShopView } from "./shop-tile";

type Sort = "featured" | "price-asc" | "price-desc";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

/**
 * Shop listing: title and count, a toolbar (product/look toggle, category
 * filter, sort), then the same flush hairline-divided 4-up grid as the
 * homepage. The toggle flips every tile between bare product and on-model, as
 * about:blank does. Quick-add and sizes are deliberately not here until there
 * is a cart to add to.
 */
export function ShopListing({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  const [view, setView] = useState<ShopView>("look");
  const [sort, setSort] = useState<Sort>("featured");
  const [category, setCategory] = useState<Category | "all">("all");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );

  const visible = useMemo(() => {
    const filtered =
      category === "all"
        ? products
        : products.filter((p) => p.category === category);
    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, category, sort]);

  const chip = (active: boolean) =>
    `font-sans text-sm transition-colors ${
      active ? "text-ink underline underline-offset-4" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <section className="bg-surface">
      <div className="px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 font-sans text-sm text-ink-muted">
          {visible.length} {visible.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-y border-outline px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div role="group" aria-label="Photo view" className="flex gap-4">
            {(["look", "product"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={view === value}
                onClick={() => setView(value)}
                className={chip(view === value)}
              >
                {value === "look" ? "Look" : "Product"}
              </button>
            ))}
          </div>

          {categories.length > 1 && (
            <div role="group" aria-label="Category" className="flex gap-4">
              <button
                type="button"
                aria-pressed={category === "all"}
                onClick={() => setCategory("all")}
                className={chip(category === "all")}
              >
                All
              </button>
              {categories.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={category === value}
                  onClick={() => setCategory(value)}
                  className={chip(category === value)}
                >
                  {CATEGORY_LABELS[value]}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 font-sans text-sm text-ink-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="bg-transparent py-1 text-ink focus:outline-none"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-px bg-outline lg:grid-cols-4">
          {visible.map((product) => (
            <ShopTile
              key={product.slug}
              product={product}
              view={view}
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          ))}
        </div>
      ) : (
        <div className="px-4 py-24 sm:px-6 lg:px-8">
          <p className="font-sans text-sm text-ink-muted">
            Nothing here yet.{" "}
            <Link
              href="/shop"
              className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
            >
              See everything
            </Link>
          </p>
        </div>
      )}

      <div className="pb-16 lg:pb-24" />
    </section>
  );
}
