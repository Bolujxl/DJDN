"use client";

import { useActionState } from "react";

import { requestOrderStatus } from "@/app/(site)/track-order/request-actions";
import {
  EMPTY_STATUS_REQUEST,
  type StatusField,
} from "@/lib/status-request";
import { EMAIL_URL, SITE, WHATSAPP_URL } from "@/lib/site";

const INPUT =
  "w-full rounded-[18px] border border-outline bg-surface px-5 py-3 font-sans text-base text-ink placeholder:text-ink-muted transition-colors focus:border-primary";

const LABEL = "mb-2 block font-sans text-xs text-ink-muted";

const LINK =
  "text-ink underline underline-offset-4 transition-colors hover:text-primary";

/**
 * Track order without a database: order number and email in, an email to
 * DJDN out, and a person replies with the status. WhatsApp sits under the form
 * because that is often quicker for both sides.
 */
export function StatusRequestForm() {
  const [state, action, pending] = useActionState(
    requestOrderStatus,
    EMPTY_STATUS_REQUEST,
  );

  const heading = (
    <>
      <h1 className="text-center text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        Track your order
      </h1>
      <p className="mb-10 mt-4 max-w-sm text-center font-sans text-sm leading-relaxed text-ink-muted">
        Send us your order number and the email you used. We&rsquo;ll reply
        with where it is and the courier details.
      </p>
    </>
  );

  if (state.status === "sent") {
    return (
      <section className="flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center bg-background px-4 py-20 sm:px-6 lg:px-8">
        <div role="status" className="w-full max-w-sm text-center">
          <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
            Request sent
          </h1>
          <p className="mt-6 font-sans text-sm leading-relaxed text-ink">
            Your reference is{" "}
            <span className="font-medium tabular-nums">{state.reference}</span>.
          </p>
          <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
            We&rsquo;ll reply to {state.values.email} with the status of order{" "}
            {state.values.orderId}. We answer {SITE.hours}.
          </p>
        </div>
      </section>
    );
  }

  const error = (field: StatusField) => state.fieldErrors[field];
  const props = (name: StatusField) => ({
    id: `status-${name}`,
    name,
    defaultValue: state.values[name],
    "aria-invalid": error(name) ? true : undefined,
    "aria-describedby": error(name) ? `status-${name}-error` : undefined,
  });
  const fieldError = (name: StatusField) =>
    error(name) && (
      <p
        id={`status-${name}-error`}
        className="mt-2 font-sans text-sm text-error"
      >
        {error(name)}
      </p>
    );

  return (
    <section className="flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center bg-background px-4 py-20 sm:px-6 lg:px-8">
      {heading}

      <form action={action} noValidate className="flex w-full max-w-sm flex-col gap-5">
        <div>
          <label htmlFor="status-orderId" className={LABEL}>
            Order number
          </label>
          <input
            {...props("orderId")}
            required
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="From your order email"
            className={INPUT}
          />
          {fieldError("orderId")}
        </div>
        <div>
          <label htmlFor="status-email" className={LABEL}>
            Email
          </label>
          <input
            {...props("email")}
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={INPUT}
          />
          {fieldError("email")}
        </div>

        {/* Bots fill every field they find; people never see this one. */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label>
            Leave this empty
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-[18px] border border-ink px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Sending…" : "Ask about my order"}
        </button>

        <div role="alert" className="min-h-6 font-sans text-sm leading-relaxed text-error">
          {state.message && (
            <>
              {state.message}{" "}
              <a href={EMAIL_URL} className="underline underline-offset-4">
                Email
              </a>{" "}
              ·{" "}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                WhatsApp
              </a>
            </>
          )}
        </div>
      </form>

      <p className="mt-4 max-w-sm text-center font-sans text-sm text-ink-muted">
        In a hurry?{" "}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK}
        >
          Message us on WhatsApp
        </a>
        .
      </p>
    </section>
  );
}
