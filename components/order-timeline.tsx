import {
  ORDER_STEPS,
  completedSteps,
  type FulfilmentStatus,
  type OrderEvent,
  type PaymentStatus,
} from "@/lib/orders";

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

/**
 * The order's progress as a vertical list: placed, payment confirmed,
 * processing, dispatched, delivered. A filled dot is done, the orange ring is
 * where the order is now, an empty dot is still to come. Dates come from the
 * order's events when there is one for the step. Cancelled, failed and
 * refunded orders get a plain notice instead of a misleading "in progress".
 */
export function OrderTimeline({
  payment,
  fulfilment,
  events,
}: {
  payment: PaymentStatus;
  fulfilment: FulfilmentStatus;
  events: OrderEvent[];
}) {
  const stopped =
    fulfilment === "cancelled"
      ? "This order was cancelled."
      : payment === "failed"
        ? "The payment didn't go through, so this order hasn't been placed. Nothing was charged."
        : payment === "refunded"
          ? "This order has been refunded."
          : null;

  const done = completedSteps(payment, fulfilment);

  return (
    <div>
      {stopped && (
        <p
          role="status"
          className="mb-6 border border-outline px-5 py-4 font-sans text-sm text-ink"
        >
          {stopped}
        </p>
      )}
      <ol className="font-sans text-sm">
        {ORDER_STEPS.map((label, index) => {
          const complete = index < done;
          const current = index === done - 1 && !stopped && done < 5;
          const when = events.find(
            (event) => event.label.toLowerCase() === label.toLowerCase(),
          )?.created_at;
          const last = index === ORDER_STEPS.length - 1;
          return (
            <li
              key={label}
              aria-current={current ? "step" : undefined}
              className="relative flex gap-4 pb-8 last:pb-0"
            >
              {!last && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[7px] top-5 h-[calc(100%-1.25rem)] w-px ${
                    index < done - 1 ? "bg-ink" : "bg-outline"
                  }`}
                />
              )}
              <span
                aria-hidden="true"
                className={`relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full border ${
                  complete
                    ? current
                      ? "border-primary bg-primary ring-4 ring-primary/20"
                      : "border-ink bg-ink"
                    : "border-outline bg-surface"
                }`}
              />
              <div>
                <p className={complete ? "text-ink" : "text-ink-muted"}>
                  {label}
                  <span className="sr-only">
                    {complete
                      ? current
                        ? ", current step"
                        : ", done"
                      : ", not yet"}
                  </span>
                </p>
                {complete && when && (
                  <p className="mt-1 text-ink-muted">
                    {dateFormat.format(new Date(when))}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
