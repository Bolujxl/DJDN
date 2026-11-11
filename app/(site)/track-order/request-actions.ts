"use server";

import {
  emailOwner,
  EMAIL_PATTERN,
  makeReference,
  oneLine,
  SEND_FAILED,
} from "@/lib/email";
import {
  EMPTY_STATUS_REQUEST,
  type StatusRequestState,
} from "@/lib/status-request";

/**
 * "Where is my order?" without a database: the customer gives an order number
 * and email, and it lands in the DJDN inbox with Reply-To set to them. A person
 * answers with the status or waybill. When live tracking is switched on (see
 * app/(site)/track-order/page.tsx), this action simply stops being used.
 */
export async function requestOrderStatus(
  _previous: StatusRequestState,
  formData: FormData,
): Promise<StatusRequestState> {
  const text = (key: string) => String(formData.get(key) ?? "");
  const values: StatusRequestState["values"] = {
    orderId: oneLine(text("orderId")),
    email: oneLine(text("email")),
  };

  // A hidden field real people never fill in: bots do. Pretend it worked.
  if (text("website")) {
    return { ...EMPTY_STATUS_REQUEST, status: "sent", reference: makeReference("T") };
  }

  const fieldErrors: StatusRequestState["fieldErrors"] = {};
  if (!values.orderId) fieldErrors.orderId = "Enter your order number.";
  else if (values.orderId.length > 40) {
    fieldErrors.orderId = "That doesn’t look like an order number.";
  }
  if (!EMAIL_PATTERN.test(values.email) || values.email.length > 200) {
    fieldErrors.email = "Enter the email you used for the order.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ...EMPTY_STATUS_REQUEST, status: "error", fieldErrors, values };
  }

  const reference = makeReference("T");
  const sent = await emailOwner({
    label: "track-order",
    subject: `Order status request ${reference}: ${values.orderId}`,
    text: [
      `Order status request ${reference}`,
      "",
      `Order no.: ${values.orderId}`,
      `Email:     ${values.email}`,
      "",
      "They are asking where their order is. Reply to this email with the",
      "status or waybill.",
    ].join("\n"),
    replyTo: values.email,
  });
  if (!sent) {
    return {
      ...EMPTY_STATUS_REQUEST,
      status: "error",
      message: SEND_FAILED,
      values,
    };
  }

  return { ...EMPTY_STATUS_REQUEST, status: "sent", values, reference };
}
