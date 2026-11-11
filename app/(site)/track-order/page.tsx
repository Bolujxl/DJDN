import type { Metadata } from "next";

import { OrderLookup } from "@/components/order-lookup";
import { StatusRequestForm } from "@/components/status-request-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false },
};

/**
 * Two modes, chosen by whether the orders database is configured.
 *
 * Off (no Supabase keys, today): the customer sends their order number and
 * email, it lands in the DJDN inbox, and a person replies with the status.
 *
 * On (Supabase keys set): the live lookup and timeline in <OrderLookup />, which
 * reads the orders table. That code is kept and tested but dormant; adding the
 * keys is all it takes to switch it on.
 */
export default function TrackOrderPage() {
  if (!createAdminClient()) return <StatusRequestForm />;
  return <OrderLookup />;
}
