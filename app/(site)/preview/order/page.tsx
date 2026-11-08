import { notFound } from "next/navigation";

import { OrderDetailView } from "@/components/order-detail-view";
import { OrderLookup } from "@/components/order-lookup";
import type {
  FulfilmentStatus,
  OrderDetail,
  PaymentStatus,
} from "@/lib/orders";

/**
 * Development-only preview of the order screens with made-up data, because
 * real ones need the orders database. Open /preview/order and change the
 * query: ?view=tracking|confirmation|lookup and
 * ?status=pending|processing|dispatched|delivered|cancelled|failed.
 * Returns a 404 in production.
 */
const STATES: Record<string, [PaymentStatus, FulfilmentStatus]> = {
  pending: ["pending", "awaiting_payment"],
  processing: ["paid", "processing"],
  dispatched: ["paid", "dispatched"],
  delivered: ["paid", "delivered"],
  cancelled: ["refunded", "cancelled"],
  failed: ["failed", "awaiting_payment"],
};

function sample(status: string): OrderDetail {
  const [payment, fulfilment] = STATES[status] ?? STATES.processing;
  const day = (offset: number) =>
    new Date(Date.UTC(2026, 10, 2 + offset, 10, 30)).toISOString();

  return {
    number: "DJDN-1001",
    created_at: day(0),
    email: "ada@example.com",
    customer_name: "Ada Okafor",
    payment_status: payment,
    fulfilment_status: fulfilment,
    subtotal: 8600000,
    shipping_fee: 250000,
    total: 8850000,
    tracking_note:
      fulfilment === "dispatched"
        ? "Sent with a courier on 4 Nov. Waybill 4471920."
        : null,
    shipping_address: {
      full_name: "Ada Okafor",
      line1: "12 Admiralty Way, Lekki Phase 1",
      city: "Lekki",
      state: "Lagos",
      phone: "0803 000 0000",
    },
    items: [
      {
        product_slug: "track-jacket",
        name: "Track Jacket",
        colour: "Bottle Green",
        size: "M",
        unit_price: 5200000,
        qty: 1,
      },
      {
        product_slug: "swirl-jersey",
        name: "Swirl Jersey",
        colour: "Green",
        size: "L",
        unit_price: 3400000,
        qty: 1,
      },
    ],
    events: [
      { label: "Order placed", created_at: day(0) },
      ...(payment === "paid" || fulfilment === "delivered"
        ? [{ label: "Payment confirmed", created_at: day(0) }]
        : []),
      ...(["processing", "dispatched", "delivered"].includes(fulfilment)
        ? [{ label: "Processing", created_at: day(1) }]
        : []),
      ...(["dispatched", "delivered"].includes(fulfilment)
        ? [{ label: "Dispatched", created_at: day(2) }]
        : []),
      ...(fulfilment === "delivered"
        ? [{ label: "Delivered", created_at: day(4) }]
        : []),
    ],
  };
}

export default async function PreviewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; status?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { view = "tracking", status = "processing" } = await searchParams;

  if (view === "lookup") return <OrderLookup />;
  return (
    <OrderDetailView
      order={sample(status)}
      confirmation={view === "confirmation"}
    />
  );
}
