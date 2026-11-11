/** What the customer is asking for. The label goes in the email subject. */
export const RETURN_KINDS = {
  exchange: "Exchange",
  refund: "Refund",
  faulty: "Faulty or wrong item",
} as const;

export type ReturnKind = keyof typeof RETURN_KINDS;

export type ReturnField = "name" | "email" | "orderId" | "kind" | "details";

export type ReturnState = {
  status: "idle" | "sent" | "error";
  /** Shown above the button when the whole request failed (not one field). */
  message: string | null;
  fieldErrors: Partial<Record<ReturnField, string>>;
  /** What was typed, so a failed submit doesn't wipe the form. */
  values: Record<ReturnField, string>;
  /** Short code the customer can quote, set once the request has been sent. */
  reference: string | null;
};

export const EMPTY_RETURN: ReturnState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: { name: "", email: "", orderId: "", kind: "", details: "" },
  reference: null,
};
