import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderDetailView } from "@/components/order-detail-view";
import { getOrderDetail } from "@/lib/orders-server";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

/**
 * Where the payment provider sends the customer back to. The `ref` is the
 * payment reference we generated for the order, which can't be guessed, so it
 * is enough to show that one order. A payment still pending says so instead
 * of claiming success. (Checking the payment with the provider before an order
 * is marked paid happens when payment is wired in, not here.)
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  const order = await getOrderDetail({ txRef: ref });
  if (!order) notFound();

  return <OrderDetailView order={order} confirmation />;
}
