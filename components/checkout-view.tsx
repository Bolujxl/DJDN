"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatNaira } from "@/lib/format";
import { NIGERIAN_STATES } from "@/lib/nigeria";

import { findProduct, lineKey, useCart } from "./cart-provider";

/**
 * Checkout screen: contact, delivery address, then a sticky order summary.
 * Validation and layout are real; the pay button is not. There is no payment
 * gateway or order storage yet, so a valid form just says so instead of
 * pretending to charge anyone. Delivery isn't priced yet either (rates are
 * undecided), so the summary says it is confirmed rather than showing a
 * number that would be made up.
 */
type Fields = {
  email: string;
  phone: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  notes: string;
};

const EMPTY: Fields = {
  email: "",
  phone: "",
  fullName: "",
  address: "",
  city: "",
  state: "",
  notes: "",
};

type Errors = Partial<Record<keyof Fields, string>>;

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (values.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Enter a phone number we can reach you on.";
  if (!values.fullName.trim()) errors.fullName = "Enter your full name.";
  if (!values.address.trim()) errors.address = "Enter your delivery address.";
  if (!values.city.trim()) errors.city = "Enter your city or town.";
  if (!values.state) errors.state = "Choose your state.";
  return errors;
}

export function CheckoutView() {
  const { items } = useCart();
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const lines = items.flatMap((item) => {
    const product = findProduct(item.slug);
    if (!product) return [];
    const colourway =
      product.colourways.find((c) => c.name === item.colour) ??
      product.colourways[0];
    return [{ item, product, colourway }];
  });
  const subtotal = lines.reduce(
    (total, line) => total + line.product.price * line.item.qty,
    0,
  );

  function set(field: keyof Fields) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setValues((current) => ({ ...current, [field]: e.target.value }));
      if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setSubmitted(Object.keys(found).length === 0);
  }

  if (lines.length === 0) {
    return (
      <section className="bg-surface px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
        <h1 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
          Checkout
        </h1>
        <p className="mt-8 font-sans text-sm text-ink-muted">
          Your cart is empty.{" "}
          <Link
            href="/shop"
            className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
          >
            Keep shopping
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="bg-surface px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
      <Link
        href="/cart"
        className="font-sans text-sm text-ink-muted transition-colors hover:text-ink"
      >
        Back to cart
      </Link>
      <h1 className="mt-6 text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        Checkout
      </h1>

      <form
        onSubmit={onSubmit}
        noValidate
        className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16"
      >
        <div className="space-y-12 lg:col-span-7">
          <fieldset>
            <legend className="w-full border-b border-outline pb-4 font-sans text-sm text-ink-muted">
              Contact
            </legend>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                value={values.email}
                error={errors.email}
                onChange={set("email")}
                hint="Your order confirmation goes here."
              />
              <Field
                id="phone"
                label="Phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                error={errors.phone}
                onChange={set("phone")}
                hint="For the delivery rider."
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="w-full border-b border-outline pb-4 font-sans text-sm text-ink-muted">
              Delivery address
            </legend>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  id="fullName"
                  label="Full name"
                  autoComplete="name"
                  value={values.fullName}
                  error={errors.fullName}
                  onChange={set("fullName")}
                />
              </div>
              <div className="sm:col-span-2">
                <Field
                  id="address"
                  label="Street address"
                  autoComplete="address-line1"
                  value={values.address}
                  error={errors.address}
                  onChange={set("address")}
                />
              </div>
              <Field
                id="city"
                label="City or town"
                autoComplete="address-level2"
                value={values.city}
                error={errors.city}
                onChange={set("city")}
              />
              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block font-sans text-xs text-ink-muted"
                >
                  State
                </label>
                <select
                  id="state"
                  autoComplete="address-level1"
                  value={values.state}
                  onChange={set("state")}
                  aria-invalid={Boolean(errors.state)}
                  aria-describedby={errors.state ? "state-error" : undefined}
                  className={`${INPUT} ${values.state ? "text-ink" : "text-ink-muted"}`}
                >
                  <option value="">Choose a state</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && <ErrorText id="state-error" text={errors.state} />}
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="notes"
                  className="mb-2 block font-sans text-xs text-ink-muted"
                >
                  Delivery notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={values.notes}
                  onChange={set("notes")}
                  placeholder="Landmark, gate code, best time to call"
                  className={`${INPUT} resize-none`}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="w-full border-b border-outline pb-4 font-sans text-sm text-ink-muted">
              Payment
            </legend>
            <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
              You&rsquo;ll pay securely on the next step, by card, bank transfer
              or USSD. We never see or store your card details.
            </p>
          </fieldset>
        </div>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <p className="border-b border-outline pb-4 font-sans text-sm text-ink-muted">
              Order summary
            </p>

            <ul>
              {lines.map(({ item, product, colourway }) => {
                const thumb = colourway.look ?? colourway.product;
                return (
                  <li
                    key={lineKey(item)}
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
                            thumb === colourway.product
                              ? "object-contain p-[3%]"
                              : "object-cover"
                          }
                        />
                      )}
                    </div>
                    <div className="flex flex-1 items-start justify-between gap-4 font-sans text-sm">
                      <div>
                        <p className="text-ink">{product.name}</p>
                        <p className="mt-1 text-ink-muted">
                          {item.colour}, size {item.size}
                        </p>
                        <p className="mt-1 text-ink-muted">Qty {item.qty}</p>
                      </div>
                      <p className="tabular-nums text-ink">
                        {formatNaira(product.price * item.qty)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <dl className="space-y-3 py-6 font-sans text-sm">
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="tabular-nums text-ink">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-ink-muted">Delivery</dt>
                <dd className="text-right text-ink-muted">
                  Confirmed once we have your address
                </dd>
              </div>
            </dl>

            <div className="flex items-baseline justify-between border-t border-outline pt-6 font-sans text-sm">
              <p className="text-ink">Total</p>
              <p className="tabular-nums text-ink">{formatNaira(subtotal)}</p>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-[18px] border border-ink px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98]"
            >
              Continue to payment
            </button>

            <p
              role="status"
              className="mt-4 min-h-10 font-sans text-sm leading-relaxed text-ink-muted"
            >
              {submitted
                ? "Payment isn't switched on yet, so nothing has been charged. Your details are valid and ready."
                : Object.keys(errors).length > 0
                  ? "Please fix the highlighted fields."
                  : ""}
            </p>
          </div>
        </aside>
      </form>
    </section>
  );
}

const INPUT =
  "w-full rounded-[18px] border border-outline bg-surface px-5 py-3 font-sans text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-primary aria-[invalid=true]:border-error";

function ErrorText({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} role="alert" className="mt-2 font-sans text-xs text-error">
      {text}
    </p>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type = "text",
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-sans text-xs text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={INPUT}
      />
      {error ? (
        <ErrorText id={`${id}-error`} text={error} />
      ) : (
        hint && (
          <p className="mt-2 font-sans text-xs text-ink-muted">{hint}</p>
        )
      )}
    </div>
  );
}
