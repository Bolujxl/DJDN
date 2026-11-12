import type { Metadata } from "next";

import { OrderLookup } from "@/components/order-lookup";
import { StatusRequestForm } from "@/components/status-request-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false },
};

/**
 * Two modes.
 *
 * Off (today): the customer sends their order number and email, it lands in
 * the DJDN inbox, and a person replies with the status.
 *
 * On: the live lookup and timeline in <OrderLookup />, which reads the orders
 * table. It needs the Supabase keys AND LIVE_TRACKING=true. The second switch
 * is separate on purpose: Supabase can be on for accounts and sign-in while no
 * orders exist yet, and the live lookup would then say "not found" to everyone.
 * Set LIVE_TRACKING once checkout is creating orders.
 */
export default function TrackOrderPage() {
  const live = process.env.LIVE_TRACKING === "true" && createAdminClient();
  if (!live) return <StatusRequestForm />;
  return <OrderLookup />;
}
