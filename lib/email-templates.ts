import { formatNaira } from "@/lib/format";
import type { OrderDetail } from "@/lib/orders";
import { EMAIL_URL, SITE, SITE_URL, WHATSAPP_URL } from "@/lib/site";

/**
 * Customer emails in the DJDN look: a bottle green header with the logo, white
 * body on cream, one green button, and the same plain voice as the site.
 *
 * Built the way email apps need: table layout, inline styles, 600px wide,
 * Arial (custom fonts like Switzer are ignored by most inboxes), and nothing
 * important carried by an image, since many apps block them until asked. Each
 * template returns the HTML and a plain-text copy; sending them is a separate
 * step (it needs a verified domain, see lib/email.ts).
 *
 * Preview any of them in development at /preview/email.
 */
export type RenderedEmail = { subject: string; html: string; text: string };

const INK = "#1c1917";
const MUTED = "#6f6a63";
const CREAM = "#faf6ef";
const OAT = "#f1e9d8";
const GREEN = "#1f3d2b";
const ON_GREEN = "#f4f0e7";
const LINE = "#e5ddd0";
const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";

/** The days to post a return back, and the refund time. Match the returns page. */
const POST_BACK_DAYS = 5;
const REFUND_DAYS = 14;

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const firstName = (full: string) => full.trim().split(/\s+/)[0] || "there";

type Block = { html: string; text: string };

const heading = (title: string): Block => ({
  html: `<h1 style="margin:0 0 20px;font-family:${FONT};font-size:32px;line-height:1.1;font-weight:600;letter-spacing:-1px;color:${INK};">${esc(title)}</h1>`,
  text: `${title.toUpperCase()}\n`,
});

const para = (content: string, muted = false): Block => ({
  html: `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:${muted ? MUTED : INK};">${esc(content)}</p>`,
  text: content,
});

/** A reference the customer can quote, set in the same oat box as on the site. */
const reference = (label: string, code: string): Block => ({
  html: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:${OAT};border:1px solid ${LINE};border-radius:14px;padding:14px 22px;"><div style="font-family:${FONT};font-size:12px;color:${MUTED};">${esc(label)}</div><div style="margin-top:4px;font-family:${FONT};font-size:24px;letter-spacing:2px;font-weight:600;color:${INK};">${esc(code)}</div></td></tr></table>`,
  text: `${label}: ${code}`,
});

const button = (label: string, href: string): Block => ({
  html: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:${GREEN};border-radius:14px;"><a href="${esc(href)}" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:15px;color:${ON_GREEN};text-decoration:none;">${esc(label)}</a></td></tr></table>`,
  text: `${label}: ${href}`,
});

const steps = (items: string[]): Block => ({
  html: `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 20px;">${items
    .map(
      (item, index) =>
        `<tr><td valign="top" width="28" style="padding:6px 0;font-family:${FONT};font-size:15px;color:${MUTED};">${index + 1}</td><td style="padding:6px 0;font-family:${FONT};font-size:15px;line-height:1.55;color:${INK};">${esc(item)}</td></tr>`,
    )
    .join("")}</table>`,
  text: items.map((item, index) => `${index + 1}. ${item}`).join("\n"),
});

/** Label and value pairs, with a hairline between them. */
const details = (rows: [string, string][]): Block => ({
  html: `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 24px;border-top:1px solid ${LINE};">${rows
    .map(
      ([label, value]) =>
        `<tr><td valign="top" width="38%" style="padding:12px 12px 12px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:13px;color:${MUTED};">${esc(label)}</td><td valign="top" style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:15px;line-height:1.5;color:${INK};">${esc(value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`,
  text: rows.map(([label, value]) => `${label}: ${value.replace(/\n/g, ", ")}`).join("\n"),
});

/** A short call-out, for the one thing the customer must not miss. */
const callout = (content: string): Block => ({
  html: `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 20px;"><tr><td style="border-left:3px solid ${GREEN};padding:4px 0 4px 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">${esc(content)}</td></tr></table>`,
  text: `Note: ${content}`,
});

function orderTable(order: OrderDetail): Block {
  const line = (left: string, right: string, strong = false) =>
    `<tr><td style="padding:6px 0;font-family:${FONT};font-size:14px;color:${strong ? INK : MUTED};${strong ? "font-weight:600;" : ""}">${esc(left)}</td><td align="right" style="padding:6px 0;font-family:${FONT};font-size:14px;color:${INK};${strong ? "font-weight:600;" : ""}">${esc(right)}</td></tr>`;

  const items = order.items
    .map(
      (item) =>
        `<tr><td style="padding:14px 12px 14px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:15px;line-height:1.45;color:${INK};">${esc(item.name)}<div style="font-size:13px;color:${MUTED};">${esc(item.colour)}, size ${esc(item.size)}, qty ${item.qty}</div></td><td align="right" valign="top" style="padding:14px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:15px;color:${INK};white-space:nowrap;">${esc(formatNaira(item.unit_price * item.qty))}</td></tr>`,
    )
    .join("");

  return {
    html: `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 24px;border-top:1px solid ${LINE};">${items}<tr><td colspan="2" style="padding-top:10px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%">${line("Subtotal", formatNaira(order.subtotal))}${line("Delivery", order.shipping_fee === 0 ? "Free" : formatNaira(order.shipping_fee))}${line("Total", formatNaira(order.total), true)}</table></td></tr></table>`,
    text: [
      ...order.items.map(
        (item) =>
          `${item.name} (${item.colour}, size ${item.size}) x${item.qty}: ${formatNaira(item.unit_price * item.qty)}`,
      ),
      `Subtotal: ${formatNaira(order.subtotal)}`,
      `Delivery: ${order.shipping_fee === 0 ? "Free" : formatNaira(order.shipping_fee)}`,
      `Total: ${formatNaira(order.total)}`,
    ].join("\n"),
  };
}

function layout(subject: string, preheader: string, blocks: Block[]): RenderedEmail {
  const body = blocks.map((block) => block.html).join("");
  const text = [
    ...blocks.map((block) => block.text),
    "",
    "Questions? Email " + SITE.email + " or message us on WhatsApp, " + SITE.whatsappDisplay + ".",
    "We answer " + SITE.hours + ".",
    "",
    "DJDN",
  ].join("\n\n");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
<tr><td style="background:${GREEN};padding:26px 32px;border-radius:18px 18px 0 0;">
<a href="${SITE_URL}" style="text-decoration:none;"><img src="${SITE_URL}/brand/logo/djdn-logo-white.png" alt="DJDN" width="68" height="30" style="display:block;border:0;width:68px;height:30px;font-family:${FONT};font-size:22px;font-weight:700;color:${ON_GREEN};"></a>
</td></tr>
<tr><td style="background:#ffffff;border-left:1px solid ${LINE};border-right:1px solid ${LINE};padding:36px 32px 20px;">
${body}
</td></tr>
<tr><td style="background:#ffffff;border:1px solid ${LINE};border-top:1px solid ${LINE};border-radius:0 0 18px 18px;padding:20px 32px 28px;font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED};">
Questions? Email <a href="${EMAIL_URL}" style="color:${INK};">${esc(SITE.email)}</a> or message us on <a href="${WHATSAPP_URL}" style="color:${INK};">WhatsApp</a>, ${esc(SITE.whatsappDisplay)}.<br>
We answer ${esc(SITE.hours)}.
</td></tr>
<tr><td align="center" style="padding:20px 12px 4px;font-family:${FONT};font-size:12px;color:${MUTED};">
DJDN &middot; <a href="${esc(SITE.instagram)}" style="color:${MUTED};">${esc(SITE.instagramHandle)}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}

/** Sent once a payment clears: what was bought, where it is going, how to ask about it. */
export function orderConfirmedEmail(order: OrderDetail): RenderedEmail {
  const address = order.shipping_address;
  return layout(`Your DJDN order ${order.number}`, "We have your order and we are getting it ready.", [
    heading(`Thank you, ${firstName(order.customer_name)}.`),
    para(
      "We've received your order and your payment, and we're getting it ready. We'll message you when it's on its way.",
    ),
    reference("Order number", order.number),
    orderTable(order),
    details([
      [
        "Delivering to",
        [address.full_name, address.line1, `${address.city}, ${address.state}`, address.phone]
          .filter(Boolean)
          .join("\n"),
      ],
    ]),
    button("Ask about your order", `${SITE_URL}/track-order`),
    para("Send us your order number and the email you used at checkout, and we'll tell you where it is.", true),
  ]);
}

type ReturnKind = "Exchange" | "Refund" | "Faulty or wrong item";

/** Confirms the returns form was received and says what comes next. */
export function returnReceivedEmail(data: {
  name: string;
  reference: string;
  orderId: string;
  kind: ReturnKind;
}): RenderedEmail {
  return layout(`We've got your return request ${data.reference}`, "Please don't post anything yet. We'll reply with the next steps.", [
    heading("Request received."),
    para(
      `Hi ${firstName(data.name)}, thanks for letting us know. We've got your request for order ${data.orderId}.`,
    ),
    reference("Your reference", data.reference),
    steps([
      "We check your request and reply by email.",
      "Our reply has the return address, and the return charge if you asked for a refund.",
      `You then have ${POST_BACK_DAYS} working days to post the item back.`,
    ]),
    callout("Please don't post anything until you've heard from us."),
  ]);
}

/** Sent when a request is approved: where to send it, and what must be true when it arrives. */
export function returnApprovedEmail(data: {
  name: string;
  reference: string;
  orderId: string;
  kind: ReturnKind;
  returnAddress: string;
  /** In kobo. Only for refunds, where the charge comes off the refund. */
  returnCharge?: number;
}): RenderedEmail {
  const refund = data.kind === "Refund";
  return layout(`Your return ${data.reference} is approved`, "Here is where to send it and what to include.", [
    heading("Return approved."),
    para(`Hi ${firstName(data.name)}, your request for order ${data.orderId} is approved.`),
    details([
      ["Reference", data.reference],
      ["Send it to", data.returnAddress],
      ["Post it within", `${POST_BACK_DAYS} working days of this email`],
      ...(refund && data.returnCharge !== undefined
        ? ([["Return charge", `${formatNaira(data.returnCharge)}, taken from your refund`]] as [string, string][])
        : refund
          ? ([["Return charge", "Taken from your refund"]] as [string, string][])
          : ([["Exchange", "Free"]] as [string, string][])),
    ]),
    steps([
      "Check the item is unworn and unused, with its tags still attached.",
      "Pack it and post it to the address above.",
      "Send us the waybill number by email or WhatsApp.",
      refund
        ? "When it reaches us we check it and email you about your refund."
        : "When it reaches us we check it and send out your exchange.",
    ]),
    ...(refund ? [para("The delivery fee you paid on the original order isn't refunded.", true)] : []),
  ]);
}

/** Sent when a refund has been processed. Amounts are in kobo. */
export function refundProcessedEmail(data: {
  name: string;
  reference: string;
  orderId: string;
  charge: number;
  refund: number;
}): RenderedEmail {
  return layout("Your DJDN refund has been processed", "Your refund is on its way to you.", [
    heading("Refund processed."),
    para(`Hi ${firstName(data.name)}, we've received your return and processed your refund.`),
    details([
      ["Return reference", data.reference],
      ["Order", data.orderId],
      ["Return charge", formatNaira(data.charge)],
      ["Your refund", formatNaira(data.refund)],
    ]),
    para(`Please allow up to ${REFUND_DAYS} business days for it to reach you.`),
    para("If it hasn't arrived by then, reply with your reference and we'll look into it.", true),
  ]);
}
