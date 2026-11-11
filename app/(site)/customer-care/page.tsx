import type { Metadata } from "next";
import Link from "next/link";

import { COUNTRIES, COUNTRY_CODES } from "@/lib/currency";
import { EMAIL_URL, SITE, WHATSAPP_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Customer care",
  description:
    "Reach DJDN on WhatsApp or email, Monday to Saturday, 8am to 9pm, and see how delivery works.",
};

const LINK =
  "text-ink underline underline-offset-4 transition-colors hover:text-primary";

/**
 * Contact and shipping on one page (the footer's "Customer care", the old
 * /contact URL and the product page's shipping link all land here). Only facts
 * the business has confirmed are stated. Delivery fees and times are not yet
 * decided, so the page says they are shown at checkout rather than naming
 * numbers.
 */
export default function CustomerCarePage() {
  return (
    <section className="bg-surface px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        Customer care
      </h1>
      <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
        A real person answers. Message us for anything about an order, sizing
        or delivery.
      </p>

      <div id="contact" className="mt-16 scroll-mt-28 border-t border-outline pt-8">
        <h2 className="font-sans text-sm text-ink-muted">Contact us</h2>
        {/* Three facts at one calm size: how to reach us, and when. The time
            zone is spelled out once, small, under the hours. */}
        <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="font-sans text-xs text-ink-muted">WhatsApp</dt>
            <dd className="mt-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-baseline gap-1.5 text-xl leading-tight tracking-[-0.02em] text-ink transition-colors hover:text-primary sm:text-2xl"
              >
                <span className="tabular-nums">{SITE.whatsappDisplay}</span>
                <span
                  aria-hidden="true"
                  className="text-base text-ink-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                >
                  ↗
                </span>
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-ink-muted">Email</dt>
            <dd className="mt-2">
              <a
                href={EMAIL_URL}
                className="break-all text-xl leading-tight tracking-[-0.02em] text-ink underline decoration-outline decoration-1 underline-offset-[6px] transition-colors hover:text-primary hover:decoration-primary sm:text-2xl"
              >
                {SITE.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-ink-muted">Hours</dt>
            <dd className="mt-2">
              <p className="text-xl leading-tight tracking-[-0.02em] text-ink sm:text-2xl">
                {SITE.hoursParts.days}, {SITE.hoursParts.time}
              </p>
              <p className="mt-1.5 font-sans text-xs text-ink-muted">
                {SITE.hoursParts.zone}
              </p>
            </dd>
          </div>
        </dl>

        <p className="mt-8 font-sans text-sm text-ink-muted">
          Asking about an order? Have your order number ready, or{" "}
          <Link href="/track-order" className={LINK}>
            track it here
          </Link>
          .
        </p>
      </div>

      <div id="shipping" className="mt-16 scroll-mt-28 border-t border-outline pt-8">
        <h2 className="font-sans text-sm text-ink-muted">Shipping</h2>
        <p className="mt-6 max-w-xl font-sans text-sm leading-relaxed text-ink">
          {COUNTRY_CODES.length === 1
            ? `We deliver across ${COUNTRIES[COUNTRY_CODES[0]].name}. Prices are in ${COUNTRIES[COUNTRY_CODES[0]].currencyName}.`
            : `We ship to ${COUNTRY_CODES.map((c) => COUNTRIES[c].name).join(", ")}. Prices show in your currency once we know where you are, and you can change the country at the bottom of any page or at checkout.`}
        </p>
        <p className="mt-6 max-w-xl font-sans text-sm leading-relaxed text-ink-muted">
          Delivery fees and times depend on where you are. You&rsquo;ll see them
          at checkout once you&rsquo;ve entered your address.
        </p>

        <h3 className="mt-10 font-sans text-sm text-ink">
          Ordering from outside Nigeria
        </h3>
        <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-ink-muted">
          Based abroad, in the UK or the US for example? Message us on{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            WhatsApp
          </a>{" "}
          or{" "}
          <a href={EMAIL_URL} className={LINK}>
            email
          </a>{" "}
          and we&rsquo;ll arrange it with you directly, including price,
          delivery and any import duties or taxes that may apply on arrival.
        </p>
      </div>

      <div className="mt-16 border-t border-outline pt-8 font-sans text-sm text-ink-muted">
        Returns and exchanges:{" "}
        <Link href="/returns" className={LINK}>
          see our returns page
        </Link>
        .
      </div>
    </section>
  );
}
