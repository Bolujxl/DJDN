import type { Metadata } from "next";
import Link from "next/link";

import { ReturnForm } from "@/components/return-form";
import { EMAIL_URL, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Returns and exchanges",
  description:
    "Return or exchange a DJDN piece. Send a request below and we'll reply by email.",
};

const LINK =
  "text-ink underline underline-offset-4 transition-colors hover:text-primary";

const STEPS = [
  "Find your order number in your confirmation email.",
  "Fill in the request form.",
  "We reply by email with how to send it back, and the return charge if you want a refund.",
  "Post it back within 5 working days of our reply.",
];

/**
 * Returns policy and request form on one page. The policy is short on purpose:
 * three plain rules and what happens after. The window and the refund time are
 * stated once here, so changing them means editing this file only.
 */
export default function ReturnsPage() {
  return (
    <section className="bg-surface px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        Returns and exchanges
      </h1>
      <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
        Not quite right? You can return or exchange an eligible piece within 14
        days of getting it.
      </p>

      <div className="mt-16 grid gap-16 border-t border-outline pt-8 lg:grid-cols-2 lg:gap-24">
        <div>
          <h2 className="font-sans text-sm text-ink-muted">How it works</h2>
          <ol className="mt-6 flex flex-col gap-4">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-4 font-sans text-sm leading-relaxed text-ink">
                <span aria-hidden="true" className="tabular-nums text-ink-muted">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <h2 className="mt-14 font-sans text-sm text-ink-muted">The small print</h2>
          <dl className="mt-6 flex flex-col gap-8">
            <div>
              <dt className="font-sans text-sm text-ink">Exchanges are free</dt>
              <dd className="mt-2 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
                Send it back unworn, unused and undamaged, with its tags still
                attached and no stains or alterations, in the condition it
                reached you.
              </dd>
            </div>
            <div>
              <dt className="font-sans text-sm text-ink">Refunds</dt>
              <dd className="mt-2 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
                Prefer your money back? A return charge applies and comes off
                the refund; we tell you the amount before you send anything. The
                delivery fee you paid isn&rsquo;t refunded, because it goes to
                the courier. If
                a piece comes back in a different condition from how it left us,
                we may deduct for the difference.
              </dd>
            </div>
            <div>
              <dt className="font-sans text-sm text-ink">Faulty or wrong item</dt>
              <dd className="mt-2 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
                Choose &ldquo;Faulty or wrong item&rdquo; on the form and tell
                us what happened. We may ask for a photo.
              </dd>
            </div>
            <div>
              <dt className="font-sans text-sm text-ink">After we get it</dt>
              <dd className="mt-2 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
                Post your parcel within 5 working days of our reply. Once it
                reaches us we process it and email you. Refunds take up to 14
                business days from then.
              </dd>
            </div>
          </dl>

          <p className="mt-14 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
            Questions first? Email{" "}
            <a href={EMAIL_URL} className={LINK}>
              {SITE.email}
            </a>{" "}
            or see{" "}
            <Link href="/customer-care" className={LINK}>
              Customer care
            </Link>
            . We answer {SITE.hours}.
          </p>
        </div>

        <div id="request" className="scroll-mt-28 lg:max-w-md">
          <h2 className="font-sans text-sm text-ink-muted">Request a return</h2>
          <div className="mt-6">
            <ReturnForm />
          </div>
        </div>
      </div>
    </section>
  );
}
