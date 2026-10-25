import { Hero } from "@/components/hero";
import { NewArrivals } from "@/components/new-arrivals";
import { LookbookBanner } from "@/components/lookbook-banner";
import { ProductCategorySection } from "@/components/product-category-section";
import { HoodiesComingSoon } from "@/components/hoodies-coming-soon";
import type { TileProduct } from "@/components/product-tile";
import { tileFor } from "@/lib/catalogue";

const SHIRTS: TileProduct[] = [
  tileFor("swirl-polo", "Red"),
  tileFor("swirl-polo", "Monochrome"),
  tileFor("weekend-popover", "Cream"),
  tileFor("boxy-polo", "Black"),
];

const SHORTS: TileProduct[] = [
  tileFor("corduroy-shorts", "Navy"),
  tileFor("cargo-shorts", "Olive"),
  tileFor("relaxed-cargo", "Olive"),
];

/**
 * Home. Built section by section — Hero, then New Arrivals, a lookbook
 * banner breaking the transition, then per-category sections. `<main>` is
 * provided by the (site) layout, so this file only ever returns sections.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <LookbookBanner />
      <ProductCategorySection
        title="Shirts"
        subtitle="Swirl prints and weekend staples."
        products={SHIRTS}
      />
      <ProductCategorySection
        title="Shorts"
        subtitle="Corduroy and cargo, built to move."
        products={SHORTS}
        reverse
      />
      <HoodiesComingSoon />
    </>
  );
}
