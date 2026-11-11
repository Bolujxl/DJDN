"use server";

import {
  EMPTY_RETURN,
  RETURN_KINDS,
  type ReturnKind,
  type ReturnState,
} from "@/lib/returns";
import { SITE } from "@/lib/site";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// No 0/O or 1/I, so a reference read out over WhatsApp isn't misheard.
const REFERENCE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeReference() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `R-${Array.from(bytes, (b) => REFERENCE_CHARS[b % REFERENCE_CHARS.length]).join("")}`;
}

/** One line only: anything that goes in a subject or header can't carry a newline. */
const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

/**
 * Logs a return request by emailing it to DJDN, using Resend's HTTP API (no
 * package needed). The email is plain text so nothing a customer types can be
 * read as markup, and Reply-To is the customer, so answering the email goes
 * straight back to them.
 *
 * It does not check the order against the database: orders aren't live yet, and
 * a person looks at every request anyway.
 */
export async function submitReturn(
  _previous: ReturnState,
  formData: FormData,
): Promise<ReturnState> {
  const text = (key: string) => String(formData.get(key) ?? "");
  const values: ReturnState["values"] = {
    name: oneLine(text("name")),
    email: oneLine(text("email")),
    orderId: oneLine(text("orderId")),
    kind: text("kind"),
    details: text("details").trim(),
  };
  const fail = (
    fieldErrors: ReturnState["fieldErrors"],
    message: string | null = null,
  ): ReturnState => ({
    status: "error",
    message,
    fieldErrors,
    values,
    reference: null,
  });

  // A hidden field real people never fill in: bots do. Pretend it worked.
  if (text("website")) return { ...EMPTY_RETURN, status: "sent", reference: makeReference() };

  const fieldErrors: ReturnState["fieldErrors"] = {};
  if (!values.name) fieldErrors.name = "Enter your name.";
  else if (values.name.length > 100) fieldErrors.name = "That name is too long.";
  if (!EMAIL_PATTERN.test(values.email) || values.email.length > 200) {
    fieldErrors.email = "Enter the email you used for the order.";
  }
  if (!values.orderId) fieldErrors.orderId = "Enter your order number.";
  else if (values.orderId.length > 40) fieldErrors.orderId = "That doesn’t look like an order number.";
  if (!(values.kind in RETURN_KINDS)) fieldErrors.kind = "Choose what you’d like.";
  if (values.details.length > 2000) fieldErrors.details = "Please keep this under 2,000 characters.";
  if (Object.keys(fieldErrors).length > 0) return fail(fieldErrors);

  const reference = makeReference();
  const kind = RETURN_KINDS[values.kind as ReturnKind];

  const body = [
    `Return request ${reference}`,
    "",
    `Name:      ${values.name}`,
    `Email:     ${values.email}`,
    `Order no.: ${values.orderId}`,
    `Wants:     ${kind}`,
    "",
    "Other information:",
    values.details || "(none given)",
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Locally there's no key yet: show the request in the terminal so the form
    // can be tried. In production a missing key must not look like success.
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[returns] RESEND_API_KEY not set, so not emailed:\n\n${body}\n`);
      return { ...EMPTY_RETURN, status: "sent", values, reference };
    }
    console.error("[returns] RESEND_API_KEY is not set; return request not sent.");
    return fail({}, unavailable());
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RETURNS_FROM_EMAIL || "DJDN Returns <onboarding@resend.dev>",
        to: [process.env.RETURNS_TO_EMAIL || SITE.email],
        reply_to: values.email,
        subject: `Return request ${reference}: ${values.orderId} (${kind})`,
        text: body,
      }),
    });
    if (!response.ok) {
      console.error("[returns] Resend rejected the email:", response.status, await response.text());
      return fail({}, unavailable());
    }
  } catch (error) {
    console.error("[returns] Could not reach Resend:", error);
    return fail({}, unavailable());
  }

  return { ...EMPTY_RETURN, status: "sent", values, reference };
}

function unavailable() {
  // The form adds the email and WhatsApp links after this sentence.
  return "We couldn’t send your request just now. Please contact us directly:";
}
