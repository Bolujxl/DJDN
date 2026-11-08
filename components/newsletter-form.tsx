"use client";

import { useState } from "react";

/**
 * "Join our colony" — footer newsletter capture (brief calls this out
 * explicitly). UI + validation only for now; no email provider is wired up
 * yet (Mailchimp/Klaviyo/Resend — undecided), so this just simulates the
 * round trip. Swap the fake `submitEmail` for a real API call once that's
 * chosen — the form contract (loading/success/error) won't need to change.
 */
export function NewsletterForm({
  id = "newsletter-email",
  buttonLabel = "Sign up",
  doneMessage = "You’re in. Welcome to the colony.",
  tone = "dark",
  className = "",
}: {
  /** Unique per form on a page, since the footer's form is always present. */
  id?: string;
  buttonLabel?: string;
  doneMessage?: string;
  /** "dark" is for the green footer; "light" is for cream pages. */
  tone?: "dark" | "light";
  className?: string;
} = {}) {
  const light = tone === "light";
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // placeholder round trip
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p
        className={`font-sans text-sm ${light ? "text-ink" : "text-on-secondary"}`}
      >
        {doneMessage}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`flex max-w-md flex-col gap-3 sm:flex-row ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        id={id}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={`w-full rounded-[18px] border px-5 py-3 font-sans text-sm transition-colors ${
          light
            ? "border-outline bg-surface text-ink placeholder:text-ink-muted focus:border-primary"
            : "border-white/20 bg-white/5 text-on-secondary placeholder:text-on-secondary-muted focus:border-white/40"
        }`}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className={`shrink-0 rounded-[18px] border px-6 py-3 font-sans text-sm transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98] disabled:opacity-60 ${
          light
            ? "border-ink text-ink"
            : "border-on-secondary text-on-secondary"
        }`}
      >
        {status === "loading" ? "Sending…" : buttonLabel}
      </button>
      {status === "error" && (
        <p className="font-sans text-xs text-error sm:absolute" role="alert">
          Something went wrong. Try again.
        </p>
      )}
    </form>
  );
}
