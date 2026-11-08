/**
 * Order statuses, as stored in `supabase/schema.sql`. Payment and fulfilment
 * are tracked separately: Flutterwave decides the first, the shop owner moves
 * the second.
 */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FulfilmentStatus =
  | "awaiting_payment"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};

export const FULFILMENT_LABELS: Record<FulfilmentStatus, string> = {
  awaiting_payment: "Awaiting payment",
  processing: "Processing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type OrderSummary = {
  id: string;
  number: string;
  total: number;
  payment_status: PaymentStatus;
  fulfilment_status: FulfilmentStatus;
  created_at: string;
};

/** One line of an order, as charged (kobo). */
export type OrderLine = {
  product_slug: string;
  name: string;
  colour: string;
  size: string;
  unit_price: number;
  qty: number;
};

export type OrderEvent = { label: string; created_at: string };

/** Everything the order screens (confirmation, tracking, account) show. */
export type OrderDetail = {
  number: string;
  created_at: string;
  email: string;
  customer_name: string;
  payment_status: PaymentStatus;
  fulfilment_status: FulfilmentStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  tracking_note: string | null;
  shipping_address: {
    full_name: string;
    line1: string;
    city: string;
    state: string;
    phone?: string;
  };
  items: OrderLine[];
  events: OrderEvent[];
};

/**
 * The steps a customer sees, in order. `label` doubles as the `order_events`
 * label that carries each step's date, so write events with exactly these.
 */
export const ORDER_STEPS = [
  "Order placed",
  "Payment confirmed",
  "Processing",
  "Dispatched",
  "Delivered",
] as const;
export type OrderStep = (typeof ORDER_STEPS)[number];

/** How many of ORDER_STEPS are complete for an order in this state. */
export function completedSteps(
  payment: PaymentStatus,
  fulfilment: FulfilmentStatus,
): number {
  if (fulfilment === "delivered") return 5;
  if (fulfilment === "dispatched") return 4;
  if (fulfilment === "processing") return 3;
  if (payment === "paid") return 2;
  return 1;
}
