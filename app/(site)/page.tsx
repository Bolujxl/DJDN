import { Hero } from "@/components/hero";
import { NewArrivals } from "@/components/new-arrivals";

/**
 * Home. Built section by section — Hero, then New Arrivals. `<main>` is
 * provided by the (site) layout, so this file only ever returns sections.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <NewArrivals />
    </>
  );
}
