import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopListing } from "@/components/shop-listing";
import {
  CATALOGUE,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  type Category,
  type Department,
} from "@/lib/catalogue";

export const metadata: Metadata = { title: "Shop" };

const DEPARTMENTS: Department[] = ["men", "women"];

/**
 * Every category slug the header links to, plus a few older names that still
 * resolve. Categories with no products yet show the empty state, not a 404.
 */
const CATEGORY_SLUGS: Record<string, Category> = {
  tops: "tops",
  shirts: "tops",
  outerwear: "tops",
  pants: "pants",
  trousers: "pants",
  shorts: "pants",
  sweats: "sweats",
  hoodies: "sweats",
  "head-gear": "headgear",
  headgear: "headgear",
};

function isDepartment(value: string): value is Department {
  return (DEPARTMENTS as string[]).includes(value);
}

/** Handles /shop, /shop/men, /shop/women and /shop/{men|women}/{category}. */
export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug = [] } = await params;
  const { sort } = await searchParams;
  const [departmentSlug, categorySlug, ...extra] = slug;

  if (extra.length > 0) notFound();
  if (departmentSlug && !isDepartment(departmentSlug)) notFound();
  if (categorySlug && !(categorySlug in CATEGORY_SLUGS)) notFound();

  let products = CATALOGUE;
  if (departmentSlug && isDepartment(departmentSlug)) {
    products = products.filter((p) => p.departments.includes(departmentSlug));
  }
  if (categorySlug) {
    const wanted = CATEGORY_SLUGS[categorySlug];
    products = products.filter((p) => p.category === wanted);
  }
  if (sort === "new") products = products.filter((p) => p.isNew);

  const department = departmentSlug
    ? departmentSlug[0].toUpperCase() + departmentSlug.slice(1)
    : null;
  const category = categorySlug ? CATEGORY_SLUGS[categorySlug] : null;
  const title = sort === "new"
    ? department
      ? `New in, ${department.toLowerCase()}`
      : "New in"
    : category && department
      ? `${department}'s ${CATEGORY_LABELS[category].toLowerCase()}`
      : (department ?? "Shop");

  return (
    <ShopListing
      key={slug.join("/") + String(sort)}
      title={title}
      subtitle={category ? CATEGORY_DESCRIPTIONS[category] : undefined}
      products={products}
    />
  );
}
