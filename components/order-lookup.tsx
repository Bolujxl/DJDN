"use client";

import { useActionState, useState } from "react";

import {
  lookupOrder,
  type LookupState,
} from "@/app/(site)/track-order/actions";

import { OrderDetailView } from "./order-detail-view";

const INITIAL: LookupState = { order: null, error: null };

const INPUT =
  "w-full rounded-[18px] border border-outline bg-surface px-5 py-3 font-sans text-base text-ink placeholder:text-ink-muted transition-colors focus:border-primary";

/**
 * Guest "Track order": an order number and email in, the order's full status
 * out. Found orders replace the form; "Look up another order" brings it back.
 */
export function OrderLookup() {
  const [attempt, setAttempt] = useState(0);
  return (
    <LookupForm key={attempt} onReset={() => setAttempt((n) => n + 1)} />
  );
}

function LookupForm({ onReset }: { onReset: () => void }) {
  const [state, action, pending] = useActionState(lookupOrder, INITIAL);

  if (state.order) {
    return (
      <>
        <OrderDetailView order={state.order} />
        <div className="bg-surface px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <button
            type="button"
            onClick={onReset}
            className="font-sans text-sm text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
          >
            Look up another order
          </button>
        </div>
      </>
    );
  }

  return (
    <section className="flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center bg-background px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-center text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        Track your order
      </h1>
      <p className="mb-10 mt-4 max-w-sm text-center font-sans text-sm leading-relaxed text-ink-muted">
        Enter the order number from your confirmation email and the email you
        used at checkout.
      </p>

      <form action={action} className="flex w-full max-w-sm flex-col gap-5">
        <div>
          <label
            htmlFor="order-number"
            className="mb-2 block font-sans text-xs text-ink-muted"
          >
            Order number
          </label>
          <input
            id="order-number"
            name="number"
            required
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="DJDN-1001"
            className={INPUT}
          />
        </div>
        <div>
          <label
            htmlFor="order-email"
            className="mb-2 block font-sans text-xs text-ink-muted"
          >
            Email
          </label>
          <input
            id="order-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={INPUT}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-[18px] border border-ink px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Looking…" : "Track order"}
        </button>

        <p
          role="alert"
          className="min-h-10 font-sans text-sm leading-relaxed text-error"
        >
          {state.error}
        </p>
      </form>
    </section>
  );
}
