import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { OrderLookup } from "@/components/order-lookup";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false },
};

/** Needs the orders database; until it is configured this stays "coming soon". */
export default function TrackOrderPage() {
  if (!createAdminClient()) return <ComingSoon page="track-order" />;
  return <OrderLookup />;
}
