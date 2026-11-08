"use server";

import { getOrderDetail } from "@/lib/orders-server";
import type { OrderDetail } from "@/lib/orders";

export type LookupState = { order: OrderDetail | null; error: string | null };

/**
 * Guest order lookup. Both the order number and the email on the order must
 * match, and a miss gets the same answer whichever one was wrong, so the form
 * can't be used to find out which order numbers exist.
 */
export async function lookupOrder(
  _previous: LookupState,
  formData: FormData,
): Promise<LookupState> {
  const number = String(formData.get("number") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!number || !email) {
    return {
      order: null,
      error: "Enter your order number and the email you used at checkout.",
    };
  }

  const order = await getOrderDetail({ number, email });
  return order
    ? { order, error: null }
    : {
        order: null,
        error:
          "We couldn’t find an order with those details. Check the order number and email, then try again.",
      };
}
