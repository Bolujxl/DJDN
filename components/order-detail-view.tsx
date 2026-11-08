import Image from "next/image";
import Link from "next/link";

import { getProduct } from "@/lib/catalogue";
import { formatNaira } from "@/lib/format";
import {
  FULFILMENT_LABELS,
  PAYMENT_LABELS,
  type OrderDetail,
} from "@/lib/orders";

import { OrderTimeline } from "./order-timeline";

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * One order, in full: status and timeline on the left, what was bought,
 * totals and where it's going on the right. Used for tracking and for the
 * confirmation after paying; `confirmation` adds the thank-you heading and
 * what to expect next. A payment still pending is said plainly rather than
 * shown as success.
 */
export function OrderDetailView({
  order,
  confirmation = false,
}: {
  order: OrderDetail;
  confirmation?: boolean;
}) {
  const pending = order.payment_status === "pending";

  return (
    <section className="bg-surface px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      {confirmation ? (
        <>
          <p className="font-sans text-sm text-ink-muted">
            {pending ? "Confirming your payment" : "Order confirmed"}
          </p>
          <h1 className="mt-4 text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
            {pending ? "Almost there." : "Thank you."}
          </h1>
          <p className="mt-6 max-w-lg font-sans text-sm leading-relaxed text-ink-muted">
            {pending
              ? "We haven’t heard back from your bank yet. This page updates once the payment clears, and we’ll email you either way."
              : `We’ve sent a confirmation to ${order.email}. We’ll email you again when your order is dispatched.`}
          </p>
        </>
      ) : (
        <>
          <p className="font-sans text-sm text-ink-muted">Order</p>
          <h1 className="mt-4 text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
            {order.number}
          </h1>
        </>
      )}

      <p className="mt-6 font-sans text-sm text-ink-muted">
        {confirmation && <>Order {order.number} · </>}
        Placed {dateFormat.format(new Date(order.created_at))} ·{" "}
        {PAYMENT_LABELS[order.payment_status]} ·{" "}
        {FULFILMENT_LABELS[order.fulfilment_status]}
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="border-b border-outline pb-4 font-sans text-sm text-ink-muted">
            Status
          </p>
          <div className="mt-6">
            <OrderTimeline
              payment={order.payment_status}
              fulfilment={order.fulfilment_status}
              events={order.events}
            />
          </div>
          {order.tracking_note && (
            <p className="mt-8 border-t border-outline pt-6 font-sans text-sm leading-relaxed text-ink">
              {order.tracking_note}
            </p>
          )}
        </div>

        <div className="lg:col-span-7">
          <p className="border-b border-outline pb-4 font-sans text-sm text-ink-muted">
            Items
          </p>
          <ul>
            {order.items.map((line) => {
              const product = getProduct(line.product_slug);
              const colourway =
                product?.colourways.find((c) => c.name === line.colour) ??
                product?.colourways[0];
              const thumb = colourway?.look ?? colourway?.product;
              return (
                <li
                  key={`${line.product_slug}|${line.colour}|${line.size}`}
                  className="flex gap-4 border-b border-outline py-5"
                >
                  <div className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden bg-background">
                    {thumb && (
                      <Image
                        src={thumb}
                        alt=""
                        fill
                        sizes="72px"
                        className={
                          thumb === colourway?.product
                            ? "object-contain p-[3%]"
                            : "object-cover"
                        }
                      />
                    )}
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-4 font-sans text-sm">
                    <div>
                      {product ? (
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-ink transition-colors hover:text-primary"
                        >
                          {line.name}
                        </Link>
                      ) : (
                        <p className="text-ink">{line.name}</p>
                      )}
                      <p className="mt-1 text-ink-muted">
                        {line.colour}, size {line.size}
                      </p>
                      <p className="mt-1 text-ink-muted">Qty {line.qty}</p>
                    </div>
                    <p className="tabular-nums text-ink">
                      {formatNaira(line.unit_price * line.qty)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <dl className="space-y-3 py-6 font-sans text-sm">
            <div className="flex items-baseline justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="tabular-nums text-ink">
                {formatNaira(order.subtotal)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-ink-muted">Delivery</dt>
              <dd className="tabular-nums text-ink">
                {order.shipping_fee === 0
                  ? "Free"
                  : formatNaira(order.shipping_fee)}
              </dd>
            </div>
          </dl>
          <div className="flex items-baseline justify-between border-t border-outline pt-6 font-sans text-sm">
            <p className="text-ink">Total</p>
            <p className="tabular-nums text-ink">{formatNaira(order.total)}</p>
          </div>

          <div className="mt-12 grid gap-8 font-sans text-sm sm:grid-cols-2">
            <div>
              <p className="border-b border-outline pb-4 text-ink-muted">
                Delivering to
              </p>
              <address className="mt-6 not-italic leading-relaxed text-ink">
                {order.shipping_address.full_name}
                <br />
                {order.shipping_address.line1}
                <br />
                {order.shipping_address.city}, {order.shipping_address.state}
                {order.shipping_address.phone && (
                  <>
                    <br />
                    {order.shipping_address.phone}
                  </>
                )}
              </address>
            </div>
            <div>
              <p className="border-b border-outline pb-4 text-ink-muted">
                Need help?
              </p>
              <p className="mt-6 leading-relaxed text-ink-muted">
                Quote {order.number} when you{" "}
                <Link
                  href="/customer-care"
                  className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
                >
                  contact us
                </Link>
                .
              </p>
            </div>
          </div>

          {confirmation && (
            <div className="mt-12">
              <Link
                href="/shop"
                className="inline-block rounded-[18px] border border-ink px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98]"
              >
                Keep shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
