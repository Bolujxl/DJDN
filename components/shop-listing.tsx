"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CATEGORY_LABELS, type Category, type Product } from "@/lib/catalogue";

import { useCountry } from "./country-provider";
import { PriceRangeFilter, type PriceRange } from "./price-range-filter";
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
  subtitle,
  products,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
}) {
  const [view, setView] = useState<ShopView>("look");
  const [sort, setSort] = useState<Sort>("featured");
  const [category, setCategory] = useState<Category | "all">("all");
  const [range, setRange] = useState<PriceRange | null>(null);
  const [ready, setReady] = useState(false);
  const { country } = useCountry();

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );

  // Price bounds in whole naira, rounded out to the nearest thousand so the
  // slider ends on round numbers. Null when every piece costs the same.
  const bounds = useMemo<PriceRange | null>(() => {
    if (products.length === 0) return null;
    const prices = products.map((p) => p.price / 100);
    const low = Math.floor(Math.min(...prices) / 1000) * 1000;
    const high = Math.ceil(Math.max(...prices) / 1000) * 1000;
    return low < high ? [low, high] : null;
  }, [products]);

  // The filter choices live in the URL (?order=, ?type=, ?min=, ?max=, ?view=) so the
  // back button from a product brings the shopper back to the same list, and a
  // filtered view can be shared. The server renders the defaults; this applies
  // whatever the URL carries once the page is up.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");
    const type = params.get("type");
    const photo = params.get("view");
    const lo = Number(params.get("min"));
    const hi = Number(params.get("max"));
    if (
      bounds &&
      lo >= bounds[0] &&
      hi <= bounds[1] &&
      lo < hi &&
      (lo > bounds[0] || hi < bounds[1])
    ) {
      setRange([lo, hi]);
    }
    if (SORTS.some((s) => s.value === order)) setSort(order as Sort);
    if (categories.some((c) => c === type)) setCategory(type as Category);
    if (photo === "product") setView("product");
    setReady(true);
  }, [categories, bounds]);

  // The address bar is updated once the choices stop changing, not on every
  // movement: dragging the price slider changes them dozens of times a second,
  // and Safari on iPhone throws an error after 100 history updates in 30
  // seconds, which used to land on the "Something went wrong" page.
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const set = (key: string, value: string, fallback: string) =>
        value === fallback ? params.delete(key) : params.set(key, value);
      set("order", sort, "featured");
      set("type", category, "all");
      set("view", view, "look");
      if (range) {
        params.set("min", String(range[0]));
        params.set("max", String(range[1]));
      } else {
        params.delete("min");
        params.delete("max");
      }
      const query = params.toString();
      const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next === current) return;
      try {
        window.history.replaceState(window.history.state, "", next);
      } catch {
        // The shareable link is a nicety. If the browser refuses the update,
        // the filter still works; it must never take the page down.
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [ready, sort, category, range, view]);

  const visible = useMemo(() => {
    const filtered = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!range || (p.price / 100 >= range[0] && p.price / 100 <= range[1])),
    );
    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, category, range, sort]);

  // Complete the last desktop row (4 across) with light cards that deepen to
  // a soft ink fade at the bottom and carry a faint logo, so a sparse result
  // reads as an intentional grid, not a few tiles floating beside empty space.
  const fillers = (4 - (visible.length % 4)) % 4;

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
        {subtitle && (
          <p className="mt-4 font-sans text-sm text-ink-muted">{subtitle}</p>
        )}
        <p className="mt-2 font-sans text-sm text-ink-muted">
          {visible.length} {visible.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-y border-outline px-4 py-3 sm:px-6 lg:px-8">
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

          {/* The slider works in naira, so it only shows while prices do. */}
          {bounds && country === "NG" && (
            <PriceRangeFilter
              bounds={bounds}
              value={range}
              onChange={setRange}
              chipClass={chip}
            />
          )}
        </div>

        <label className="flex items-center gap-2 font-sans text-sm text-ink-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="bg-transparent py-1 text-base text-ink sm:text-sm"
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
        <div className="overflow-hidden">
          <div className="-mr-px grid grid-cols-2 lg:grid-cols-4">
            {visible.map((product) => (
              <div key={product.slug} className="border-b border-r border-outline">
                <ShopTile
                  product={product}
                  view={view}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
            ))}
            {Array.from({ length: fillers }, (_, index) => (
              <div
                key={`empty-${index}`}
                aria-hidden="true"
                className={`relative min-h-[16rem] items-center justify-center border-b border-r border-outline bg-surface bg-gradient-to-t from-ink/20 via-transparent to-transparent ${
                  index === 0 && visible.length % 2 === 1 ? "flex" : "hidden lg:flex"
                }`}
              >
                <Image
                  src="/brand/logo/djdn-logo.png"
                  alt=""
                  width={1080}
                  height={478}
                  className="h-auto w-[38%] opacity-[0.08]"
                />
              </div>
            ))}
          </div>
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
