export type StatusField = "orderId" | "email";

export type StatusRequestState = {
  status: "idle" | "sent" | "error";
  /** Shown above the button when the whole request failed (not one field). */
  message: string | null;
  fieldErrors: Partial<Record<StatusField, string>>;
  /** What was typed, so a failed submit doesn't wipe the form. */
  values: Record<StatusField, string>;
  /** Short code the customer can quote, set once the request has been sent. */
  reference: string | null;
};

export const EMPTY_STATUS_REQUEST: StatusRequestState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: { orderId: "", email: "" },
  reference: null,
};
