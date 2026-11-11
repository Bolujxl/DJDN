"use client";

import { useActionState } from "react";

import { submitReturn } from "@/app/(site)/returns/actions";
import { EMPTY_RETURN, RETURN_KINDS, type ReturnField } from "@/lib/returns";
import { EMAIL_URL, SITE, WHATSAPP_URL } from "@/lib/site";

const INPUT =
  "w-full rounded-[18px] border border-outline bg-surface px-5 py-3 font-sans text-base text-ink placeholder:text-ink-muted transition-colors focus:border-primary";

const LABEL = "mb-2 block font-sans text-xs text-ink-muted";

/**
 * The return request form. It emails the request to DJDN (see
 * app/(site)/returns/actions.ts); there is no account or portal behind it.
 * Four fields plus what the customer wants, and a short code they can quote.
 */
export function ReturnForm() {
  const [state, action, pending] = useActionState(submitReturn, EMPTY_RETURN);

  if (state.status === "sent") {
    return (
      <div role="status" className="border-t border-outline pt-8">
        <h2 className="text-3xl leading-[1] tracking-[-0.04em] text-ink">
          Request received
        </h2>
        <p className="mt-4 font-sans text-sm leading-relaxed text-ink">
          Your reference is{" "}
          <span className="font-medium tabular-nums">{state.reference}</span>.
        </p>
        <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
          We&rsquo;ll reply by email
          {state.values.email ? ` to ${state.values.email}` : ""} with how to send
          the item back, and the return charge if you asked for a refund. We
          answer {SITE.hours}.
        </p>
        <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
          Please don&rsquo;t post anything until you&rsquo;ve heard from us.
        </p>
      </div>
    );
  }

  const error = (field: ReturnField) => state.fieldErrors[field];
  const field = (name: ReturnField) => ({
    id: `return-${name}`,
    name,
    defaultValue: state.values[name],
    "aria-invalid": error(name) ? true : undefined,
    "aria-describedby": error(name) ? `return-${name}-error` : undefined,
  });
  const fieldError = (name: ReturnField) =>
    error(name) && (
      <p
        id={`return-${name}-error`}
        className="mt-2 font-sans text-sm text-error"
      >
        {error(name)}
      </p>
    );

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="return-name" className={LABEL}>
          Name
        </label>
        <input
          {...field("name")}
          required
          autoComplete="name"
          className={INPUT}
        />
        {fieldError("name")}
      </div>

      <div>
        <label htmlFor="return-email" className={LABEL}>
          Order email
        </label>
        <input
          {...field("email")}
          type="email"
          required
          autoComplete="email"
          placeholder="Used at checkout"
          className={INPUT}
        />
        {fieldError("email")}
      </div>

      <div>
        <label htmlFor="return-orderId" className={LABEL}>
          Order number
        </label>
        <input
          {...field("orderId")}
          required
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="e.g. DJDN-1001"
          className={INPUT}
        />
        {fieldError("orderId")}
      </div>

      <fieldset>
        <legend className={LABEL}>What would you like?</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {Object.entries(RETURN_KINDS).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 font-sans text-sm text-ink"
            >
              <input
                type="radio"
                name="kind"
                value={value}
                defaultChecked={state.values.kind === value}
                required
                className="size-4 accent-ink"
              />
              {label}
            </label>
          ))}
        </div>
        {fieldError("kind")}
      </fieldset>

      <div>
        <label htmlFor="return-details" className={LABEL}>
          Other information
        </label>
        <textarea
          {...field("details")}
          rows={5}
          placeholder="Which item, the size you’d like instead, or what’s wrong with it."
          className={`${INPUT} resize-y`}
        />
        {fieldError("details")}
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
        {pending ? "Sending…" : "Send return request"}
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
  );
}
