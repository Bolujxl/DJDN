import { Hero } from "@/components/hero";
import { NewArrivals } from "@/components/new-arrivals";
import { LookbookBanner } from "@/components/lookbook-banner";
import { ProductCategorySection } from "@/components/product-category-section";
import { HoodiesComingSoon } from "@/components/hoodies-coming-soon";
import type { TileProduct } from "@/components/product-tile";

const SHIRTS: TileProduct[] = [
  {
    name: "Swirl Polo — Red",
    price: 3400000,
    image: "/brand/lookbook/shirt-swirl-polo-red.jpg",
    hoverImage: "/brand/products/swirl-polo-red.jpg",
    hoverFit: "contain",
  },
  {
    name: "Swirl Polo — Monochrome",
    price: 3400000,
    image: "/brand/lookbook/shirt-swirl-polo-mono.jpg",
    hoverImage: "/brand/products/swirl-polo-mono.jpg",
    hoverFit: "contain",
  },
  {
    name: "Weekend Popover — Cream",
    price: 3800000,
    image: "/brand/lookbook/shirt-weekend-popover-cream.jpg",
    hoverImage: "/brand/products/linen-popover-cream.jpg",
    hoverFit: "contain",
  },
  {
    name: "Boxy Polo — Black",
    price: 3000000,
    image: "/brand/lookbook/shirt-boxy-polo-black.jpg",
    hoverImage: "/brand/products/boxy-polo-black.jpg",
    hoverFit: "contain",
  },
];

const SHORTS: TileProduct[] = [
  {
    name: "Corduroy Shorts — Navy",
    price: 2600000,
    image: "/brand/lookbook/shorts-corduroy-navy.jpg",
    hoverImage: "/brand/products/navy-corduroy-shorts.jpg",
    hoverFit: "contain",
  },
  {
    name: "Cargo Shorts — Olive",
    price: 2400000,
    image: "/brand/lookbook/shorts-cargo-olive.jpg",
    hoverImage: "/brand/products/olive-cargo-shorts.jpg",
    hoverFit: "contain",
  },
  {
    name: "Relaxed Cargo — Olive",
    price: 2500000,
    image: "/brand/lookbook/shorts-cargo-olive-back.jpg",
  },
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
