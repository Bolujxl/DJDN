"use server";

import {
  EMPTY_RETURN,
  RETURN_KINDS,
  type ReturnKind,
  type ReturnState,
} from "@/lib/returns";
import {
  emailOwner,
  EMAIL_PATTERN,
  makeReference,
  oneLine,
  SEND_FAILED,
} from "@/lib/email";

/**
 * Logs a return request by emailing it to DJDN (see lib/email.ts).
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
  if (text("website")) return { ...EMPTY_RETURN, status: "sent", reference: makeReference("R") };

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

  const reference = makeReference("R");
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

  const sent = await emailOwner({
    label: "returns",
    subject: `Return request ${reference}: ${values.orderId} (${kind})`,
    text: body,
    replyTo: values.email,
  });
  if (!sent) return fail({}, SEND_FAILED);

  return { ...EMPTY_RETURN, status: "sent", values, reference };
}
