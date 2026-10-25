import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopListing } from "@/components/shop-listing";
import { CATALOGUE, type Category, type Department } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Shop" };

const DEPARTMENTS: Department[] = ["men", "women"];

/**
 * Every category slug the header and footer link to. Slugs mapped to `null`
 * are real destinations with nothing in them yet, so they show the empty
 * state instead of a 404.
 */
const CATEGORY_SLUGS: Record<string, Category | null> = {
  shirts: "tops",
  tops: "tops",
  outerwear: "outerwear",
  shorts: "shorts",
  trousers: null,
  knitwear: null,
  dresses: null,
  accessories: null,
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
    const category = CATEGORY_SLUGS[categorySlug];
    products = category ? products.filter((p) => p.category === category) : [];
  }
  if (sort === "new") products = products.filter((p) => p.isNew);

  const department = departmentSlug
    ? departmentSlug[0].toUpperCase() + departmentSlug.slice(1)
    : null;
  const title = sort === "new"
    ? department
      ? `New in, ${department.toLowerCase()}`
      : "New in"
    : categorySlug && department
      ? `${department}'s ${categorySlug}`
      : (department ?? "Shop");

  return <ShopListing key={slug.join("/") + String(sort)} title={title} products={products} />;
}
