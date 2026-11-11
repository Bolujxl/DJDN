import type { NextRequest } from "next/server";

import {
  orderConfirmedEmail,
  refundProcessedEmail,
  returnApprovedEmail,
  returnReceivedEmail,
  type RenderedEmail,
} from "@/lib/email-templates";
import type { OrderDetail } from "@/lib/orders";
import { SITE_URL } from "@/lib/site";

/**
 * Development-only preview of the customer emails with made-up data.
 *   /preview/email                      lists them
 *   /preview/email?t=order              shows one as HTML
 *   /preview/email?t=order&view=text    shows its plain-text copy
 * Returns a 404 in production.
 */
const order: OrderDetail = {
  number: "DJDN-1001",
  created_at: "2026-11-02T10:30:00.000Z",
  email: "ada@example.com",
  customer_name: "Ada Okafor",
  payment_status: "paid",
  fulfilment_status: "processing",
  subtotal: 8600000,
  shipping_fee: 250000,
  total: 8850000,
  tracking_note: null,
  shipping_address: {
    full_name: "Ada Okafor",
    line1: "12 Admiralty Way, Lekki Phase 1",
    city: "Lekki",
    state: "Lagos",
    phone: "0803 000 0000",
  },
  items: [
    { product_slug: "track-jacket", name: "Track Jacket", colour: "Bottle Green", size: "M", unit_price: 5200000, qty: 1 },
    { product_slug: "swirl-jersey", name: "Swirl Jersey", colour: "Green", size: "L", unit_price: 3400000, qty: 1 },
  ],
  events: [],
};

const TEMPLATES: Record<string, { label: string; render: () => RenderedEmail }> = {
  order: { label: "Order confirmed", render: () => orderConfirmedEmail(order) },
  "return-received": {
    label: "Return received",
    render: () =>
      returnReceivedEmail({ name: "Ada Okafor", reference: "R-D8UMW", orderId: "DJDN-1001", kind: "Refund" }),
  },
  "return-approved": {
    label: "Return approved (refund)",
    render: () =>
      returnApprovedEmail({
        name: "Ada Okafor",
        reference: "R-D8UMW",
        orderId: "DJDN-1001",
        kind: "Refund",
        returnAddress: "DJDN Returns\n[return address]\nLagos, Nigeria",
        returnCharge: 150000,
      }),
  },
  "return-approved-exchange": {
    label: "Return approved (exchange)",
    render: () =>
      returnApprovedEmail({
        name: "Ada Okafor",
        reference: "R-K4TQ2",
        orderId: "DJDN-1001",
        kind: "Exchange",
        returnAddress: "DJDN Returns\n[return address]\nLagos, Nigeria",
      }),
  },
  refund: {
    label: "Refund processed",
    render: () =>
      refundProcessedEmail({
        name: "Ada Okafor",
        reference: "R-D8UMW",
        orderId: "DJDN-1001",
        charge: 150000,
        refund: 5050000,
      }),
  },
};

export function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const params = request.nextUrl.searchParams;
  const template = TEMPLATES[params.get("t") ?? ""];

  if (!template) {
    const links = Object.entries(TEMPLATES)
      .map(
        ([key, { label }]) =>
          `<li style="margin:0 0 10px;">${label}: <a href="?t=${key}">HTML</a> &middot; <a href="?t=${key}&view=text">plain text</a></li>`,
      )
      .join("");
    return new Response(
      `<!doctype html><meta charset="utf-8"><title>Email previews</title><body style="font-family:Arial,sans-serif;padding:32px;"><h1 style="font-size:22px;">Customer email previews</h1><ul style="padding-left:18px;font-size:15px;">${links}</ul><p style="color:#6f6a63;font-size:13px;">Made-up data. Development only.</p></body>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const email = template.render();
  if (params.get("view") === "text") {
    return new Response(`Subject: ${email.subject}\n\n${email.text}`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  // The emails link to SITE_URL (a placeholder until the domain exists), so in
  // the preview point the logo and links at this server instead.
  return new Response(email.html.replaceAll(SITE_URL, request.nextUrl.origin), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
