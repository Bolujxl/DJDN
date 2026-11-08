import { createAdminClient } from "@/lib/supabase/admin";

import type { OrderDetail } from "./orders";

/**
 * Looks one order up with the service-role key, because guests have no
 * session for row level security to key on. Callers must already hold proof
 * the order is theirs: the order number plus its email (tracking), or the
 * unguessable payment reference we generated (confirmation). Returns null
 * for "not found" and for "not configured" alike, so a failed lookup never
 * says which part was wrong.
 */
export async function getOrderDetail(
  match: { number: string; email: string } | { txRef: string },
): Promise<OrderDetail | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const query = admin
    .from("orders")
    .select(
      "id, number, created_at, email, customer_name, payment_status, fulfilment_status, subtotal, shipping_fee, total, tracking_note, shipping_address",
    );
  const { data: order } = await ("txRef" in match
    ? query.eq("flw_tx_ref", match.txRef)
    : query
        .eq("number", match.number.trim().toUpperCase())
        .eq("email", match.email.trim().toLowerCase())
  ).maybeSingle();
  if (!order) return null;

  const [{ data: items }, { data: events }] = await Promise.all([
    admin
      .from("order_items")
      .select("product_slug, name, colour, size, unit_price, qty")
      .eq("order_id", order.id),
    admin
      .from("order_events")
      .select("label, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
  ]);

  // The internal id stays server-side; the screens only need the order number.
  const rest: Record<string, unknown> = { ...order };
  delete rest.id;
  return { ...rest, items: items ?? [], events: events ?? [] } as OrderDetail;
}
