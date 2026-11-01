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
