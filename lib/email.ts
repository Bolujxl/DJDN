import { SITE } from "@/lib/site";

/**
 * Emails the business (never the customer) through Resend's HTTP API, so no
 * package is needed. Used by the returns form and the order status request.
 * The email is plain text, so nothing a customer types can be read as markup,
 * and Reply-To is the customer, so answering it goes straight back to them.
 */

// No 0/O or 1/I, so a reference read out over WhatsApp isn't misheard.
const REFERENCE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** A short code like R-D8UMW that the customer can quote and you can search for. */
export function makeReference(prefix: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `${prefix}-${Array.from(bytes, (b) => REFERENCE_CHARS[b % REFERENCE_CHARS.length]).join("")}`;
}

/** One line only: anything that goes in a subject or header can't carry a newline. */
export const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The sentence shown when sending fails; the forms add contact links after it. */
export const SEND_FAILED =
  "We couldn’t send your request just now. Please contact us directly:";

/** `true` if the business got the email (or, in development with no key, if it was printed). */
export async function emailOwner({
  label,
  subject,
  text,
  replyTo,
}: {
  /** Names the sender in the server log, e.g. "returns". */
  label: string;
  subject: string;
  text: string;
  replyTo: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Locally with no key: print it so the form can still be tried. In
    // production a missing key must never look like success.
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[${label}] RESEND_API_KEY not set, so not emailed:\n\n${text}\n`);
      return true;
    }
    console.error(`[${label}] RESEND_API_KEY is not set; request not sent.`);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || "DJDN <onboarding@resend.dev>",
        to: [process.env.OWNER_EMAIL || SITE.email],
        reply_to: replyTo,
        subject,
        text,
      }),
    });
    if (!response.ok) {
      console.error(`[${label}] Resend rejected the email:`, response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[${label}] Could not reach Resend:`, error);
    return false;
  }
}
