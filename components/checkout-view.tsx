"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  COUNTRIES,
  COUNTRY_CODES,
  isCountry,
  type CountryCode,
} from "@/lib/currency";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { US_STATES } from "@/lib/us-states";

import { findProduct, lineKey, useCart } from "./cart-provider";
import { Price, useCountry } from "./country-provider";

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
  /** Nigerian or US state, or UK county (optional). */
  state: string;
  /** UK postcode or US ZIP code. Not used for Nigeria. */
  postcode: string;
  notes: string;
};

const EMPTY: Fields = {
  email: "",
  phone: "",
  fullName: "",
  address: "",
  city: "",
  state: "",
  postcode: "",
  notes: "",
};

/** What the region field is called, and whether it is a list or free text, per country. */
const REGION: Record<CountryCode, { label: string; required: boolean }> = {
  NG: { label: "State", required: true },
  US: { label: "State", required: true },
  GB: { label: "County (optional)", required: false },
};

const POSTCODE_LABEL: Partial<Record<CountryCode, string>> = {
  GB: "Postcode",
  US: "ZIP code",
};

type Errors = Partial<Record<keyof Fields, string>>;

/** Typed details are kept for the tab's lifetime, so back or a refresh doesn't wipe the form. */
const STORAGE_KEY = "djdn-checkout";

function validate(values: Fields, country: CountryCode): Errors {
  const errors: Errors = {};
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (values.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Enter a phone number we can reach you on.";
  if (!values.fullName.trim()) errors.fullName = "Enter your full name.";
  if (!values.address.trim()) errors.address = "Enter your delivery address.";
  if (!values.city.trim()) errors.city = "Enter your city or town.";
  if (REGION[country].required && !values.state)
    errors.state = "Choose your state.";
  const postcode = values.postcode.trim();
  if (country === "GB" && !/^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/.test(postcode))
    errors.postcode = "Enter a valid UK postcode.";
  if (country === "US" && !/^\d{5}(-\d{4})?$/.test(postcode))
    errors.postcode = "Enter a 5-digit ZIP code.";
  return errors;
}

export function CheckoutView() {
  const { items } = useCart();
  const { country, setCountry } = useCountry();
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      const saved: unknown = raw ? JSON.parse(raw) : null;
      if (saved && typeof saved === "object") {
        setValues((current) => {
          const next = { ...current };
          for (const key of Object.keys(EMPTY) as (keyof Fields)[]) {
            const value = (saved as Record<string, unknown>)[key];
            if (typeof value === "string") next[key] = value;
          }
          return next;
        });
      }
    } catch {
      // Storage blocked or corrupt: start with an empty form.
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {
      // Ignore: the form still works, it just won't survive a refresh.
    }
  }, [values, restored]);

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

  // Changing country changes the currency across the site and the shape of the
  // address, so the region and postcode typed for the old one are cleared.
  function onCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!isCountry(e.target.value)) return;
    setCountry(e.target.value);
    setValues((current) => ({ ...current, state: "", postcode: "" }));
    setErrors((current) => ({ ...current, state: undefined, postcode: undefined }));
    setSubmitted(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values, country);
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
                hint="For the delivery courier."
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="w-full border-b border-outline pb-4 font-sans text-sm text-ink-muted">
              Delivery address
            </legend>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {COUNTRY_CODES.length > 1 && (
                <div className="sm:col-span-2">
                  <label
                    htmlFor="country"
                    className="mb-2 block font-sans text-xs text-ink-muted"
                  >
                    Country
                  </label>
                  <select
                    id="country"
                    autoComplete="country"
                    value={country}
                    onChange={onCountryChange}
                    className={`${INPUT} text-ink`}
                  >
                    {COUNTRY_CODES.map((code) => (
                      <option key={code} value={code}>
                        {COUNTRIES[code].name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                  {REGION[country].label}
                </label>
                {country === "GB" ? (
                  <input
                    id="state"
                    type="text"
                    autoComplete="address-level1"
                    value={values.state}
                    onChange={set("state")}
                    className={INPUT}
                  />
                ) : (
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
                    {(country === "US" ? US_STATES : NIGERIAN_STATES).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                )}
                {errors.state && <ErrorText id="state-error" text={errors.state} />}
              </div>
              {POSTCODE_LABEL[country] && (
                <Field
                  id="postcode"
                  label={POSTCODE_LABEL[country]!}
                  autoComplete="postal-code"
                  value={values.postcode}
                  error={errors.postcode}
                  onChange={set("postcode")}
                />
              )}
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
              {country === "NG"
                ? "You’ll pay securely on the next step, by card, bank transfer or USSD. We never see or store your card details."
                : "You’ll pay securely by card on the next step. We never see or store your card details."}
            </p>
            {country !== "NG" && (
              <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
                Orders to the {COUNTRIES[country].name} may be charged import
                duties or taxes when they arrive. Talk to{" "}
                <Link
                  href="/customer-care#shipping"
                  className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
                >
                  customer care
                </Link>{" "}
                before you order and we&rsquo;ll explain how it works.
              </p>
            )}
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
                        <Price kobo={product.price * item.qty} />
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <dl className="space-y-3 py-6 font-sans text-sm">
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="tabular-nums text-ink"><Price kobo={subtotal} /></dd>
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
              <p className="tabular-nums text-ink"><Price kobo={subtotal} /></p>
            </div>
            <p className="mt-3 font-sans text-xs text-ink-muted">
              All prices are in {COUNTRIES[country].currencyName}.
            </p>

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
  "w-full rounded-[18px] border border-outline bg-surface px-5 py-3 font-sans text-base text-ink placeholder:text-ink-muted transition-colors focus:border-primary aria-[invalid=true]:border-error";

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
