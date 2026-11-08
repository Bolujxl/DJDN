import type { Metadata } from "next";
import Link from "next/link";

import { ShopListing } from "@/components/shop-listing";
import {
  CATALOGUE,
  CATEGORY_LABELS,
  type Category,
  type Product,
} from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

/** Other words shoppers use for each category, so "hoodie" finds Sweats. */
const SYNONYMS: Record<Category, string[]> = {
  tops: ["top", "shirt", "shirts", "tee", "t-shirt", "outerwear"],
  pants: ["pant", "trousers", "shorts", "bottoms"],
  sweats: ["sweat", "hoodie", "hoodies", "sweatshirt", "sweatshirts"],
  headgear: ["head", "gear", "cap", "caps", "beanie", "beanies", "hat", "hats"],
};

function searchWords(product: Product): string[] {
  return [
    product.name,
    product.description,
    CATEGORY_LABELS[product.category],
    ...SYNONYMS[product.category],
    ...product.departments,
    ...product.colourways.map((c) => c.name),
  ]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Every word typed must start some word of the product's name, description,
 * category, department or colour. Matching word starts (not anywhere in the
 * text) keeps "men" from finding every "women" item.
 */
function search(query: string): Product[] {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (tokens.length === 0) return [];
  return CATALOGUE.filter((product) => {
    const words = searchWords(product);
    return tokens.every((token) => words.some((w) => w.startsWith(token)));
  });
}

function SearchForm({ query }: { query: string }) {
  return (
    <form action="/search" role="search" className="flex w-full max-w-xl gap-3">
      <label htmlFor="search-q" className="sr-only">
        Search products
      </label>
      <input
        id="search-q"
        name="q"
        type="search"
        defaultValue={query}
        maxLength={80}
        autoComplete="off"
        placeholder="Search products"
        className="w-full rounded-[18px] border border-outline bg-surface px-5 py-3 font-sans text-base text-ink placeholder:text-ink-muted transition-colors focus:border-primary"
      />
      <button
        type="submit"
        className="shrink-0 rounded-[18px] border border-ink px-6 py-3 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98]"
      >
        Search
      </button>
    </form>
  );
}

function Suggestions() {
  const links: { label: string; href: string }[] = [
    { label: "New in", href: "/new-arrivals" },
    { label: "Men", href: "/shop/men" },
    { label: "Women", href: "/shop/women" },
    ...(Object.keys(CATEGORY_LABELS) as Category[]).map((category) => ({
      label: CATEGORY_LABELS[category],
      href: `/shop/${category === "headgear" ? "head-gear" : category}`,
    })),
  ];
  return (
    <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : (q ?? "")).trim().slice(0, 80);
  const results = query ? search(query) : [];

  if (results.length > 0) {
    return (
      <>
        <div className="bg-surface px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <SearchForm query={query} />
        </div>
        <ShopListing
          title={`${results.length} ${results.length === 1 ? "result" : "results"} for “${query}”`}
          products={results}
        />
      </>
    );
  }

  return (
    <section className="bg-surface px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        {query ? `Nothing for “${query}”` : "Search"}
      </h1>
      <p className="mb-8 mt-4 font-sans text-sm text-ink-muted">
        {query
          ? "Try a different word, or browse instead."
          : "Search by name, colour or type, like “jacket”, “green” or “shorts”."}
      </p>
      <SearchForm query={query} />
      <Suggestions />
    </section>
  );
}
