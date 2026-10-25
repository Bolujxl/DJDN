import type { Metadata } from "next";

import { ShopListing } from "@/components/shop-listing";
import { CATALOGUE } from "@/lib/catalogue";

export const metadata: Metadata = { title: "New in" };

export default function NewArrivalsPage() {
  return (
    <ShopListing
      title="New in"
      products={CATALOGUE.filter((product) => product.isNew)}
    />
  );
}
