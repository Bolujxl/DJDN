"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CATEGORY_LABELS, type Category, type Product } from "@/lib/catalogue";

import type { CountryCode } from "@/lib/currency";

import { useCountry } from "./country-provider";
import { ShopTile, type ShopView } from "./shop-tile";

type Sort = "featured" | "price-asc" | "price-desc";

/** Price bands in kobo; `min` is inclusive, `max` exclusive. */
type PriceBand = { id: string; label: string; min?: number; max?: number };

const PRICE_BANDS: PriceBand[] = [
  { id: "under-30", label: "Under ₦30k", max: 3000000 },
  { id: "30-40", label: "₦30–40k", min: 3000000, max: 4000000 },
  { id: "over-40", label: "Over ₦40k", min: 4000000 },
];

function inBand(price: number, band: PriceBand) {
  return (
    (band.min === undefined || price >= band.min) &&
    (band.max === undefined || price < band.max)
  );
}

/**
 * Band label in the shopper's currency. Naira keeps the short "₦30k" style;
 * pounds and dollars are worked out from the band's edges.
 */
function bandLabel(band: PriceBand, country: CountryCode, format: (kobo: number) => string) {
  if (country === "NG") return band.label;
  if (band.min === undefined) return `Under ${format(band.max!)}`;
  if (band.max === undefined) return `Over ${format(band.min)}`;
  return `${format(band.min)} to ${format(band.max)}`;
}

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
  const [price, setPrice] = useState<PriceBand["id"] | "any">("any");
  const [ready, setReady] = useState(false);
  const { country, format } = useCountry();

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );

  // Only offer price bands that have something in them, and only when there is
  // more than one to choose between.
  const bands = useMemo(() => {
    const populated = PRICE_BANDS.filter((band) =>
      products.some((p) => inBand(p.price, band)),
    );
    return populated.length > 1 ? populated : [];
  }, [products]);

  // The filter choices live in the URL (?order=, ?type=, ?price=, ?view=) so the
  // back button from a product brings the shopper back to the same list, and a
  // filtered view can be shared. The server renders the defaults; this applies
  // whatever the URL carries once the page is up.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");
    const type = params.get("type");
    const band = params.get("price");
    const photo = params.get("view");
    if (SORTS.some((s) => s.value === order)) setSort(order as Sort);
    if (categories.some((c) => c === type)) setCategory(type as Category);
    if (PRICE_BANDS.some((b) => b.id === band)) setPrice(band as PriceBand["id"]);
    if (photo === "product") setView("product");
    setReady(true);
  }, [categories]);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(window.location.search);
    const set = (key: string, value: string, fallback: string) =>
      value === fallback ? params.delete(key) : params.set(key, value);
    set("order", sort, "featured");
    set("type", category, "all");
    set("price", price, "any");
    set("view", view, "look");
    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
    );
  }, [ready, sort, category, price, view]);

  const visible = useMemo(() => {
    const band = PRICE_BANDS.find((b) => b.id === price);
    const filtered = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!band || inBand(p.price, band)),
    );
    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, category, price, sort]);

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

          {bands.length > 0 && (
            <div role="group" aria-label="Price" className="flex gap-4">
              <button
                type="button"
                aria-pressed={price === "any"}
                onClick={() => setPrice("any")}
                className={chip(price === "any")}
              >
                Any price
              </button>
              {bands.map((band) => (
                <button
                  key={band.id}
                  type="button"
                  aria-pressed={price === band.id}
                  onClick={() => setPrice(band.id)}
                  className={chip(price === band.id)}
                >
                  {bandLabel(band, country, format)}
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
