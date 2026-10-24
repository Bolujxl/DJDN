import { Hero } from "@/components/hero";
import { NewArrivals } from "@/components/new-arrivals";
import { LookbookBanner } from "@/components/lookbook-banner";
import { ProductCategorySection } from "@/components/product-category-section";
import { HoodiesComingSoon } from "@/components/hoodies-coming-soon";

const SHIRTS = [
  {
    name: "Swirl Polo — Red",
    price: 3400000,
    image: "/brand/lookbook/shirt-swirl-polo-red.jpg",
  },
  {
    name: "Swirl Polo — Monochrome",
    price: 3400000,
    image: "/brand/lookbook/shirt-swirl-polo-mono.jpg",
  },
  {
    name: "Weekend Popover — Cream",
    price: 3800000,
    image: "/brand/lookbook/shirt-weekend-popover-cream.jpg",
  },
  {
    name: "Boxy Polo — Black",
    price: 3000000,
    image: "/brand/lookbook/shirt-boxy-polo-black.jpg",
  },
];

const SHORTS = [
  {
    name: "Corduroy Shorts — Navy",
    price: 2600000,
    image: "/brand/lookbook/shorts-corduroy-navy.jpg",
  },
  {
    name: "Cargo Shorts — Olive",
    price: 2400000,
    image: "/brand/lookbook/shorts-cargo-olive.jpg",
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
