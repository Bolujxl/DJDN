"use client";

import { useState } from "react";

/**
 * "Join our colony" — footer newsletter capture (brief calls this out
 * explicitly). UI + validation only for now; no email provider is wired up
 * yet (Mailchimp/Klaviyo/Resend — undecided), so this just simulates the
 * round trip. Swap the fake `submitEmail` for a real API call once that's
 * chosen — the form contract (loading/success/error) won't need to change.
 */
export function NewsletterForm() {
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
      <p className="font-sans text-sm text-on-secondary">
        You&rsquo;re in. Welcome to the colony.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex max-w-md flex-col gap-3 sm:flex-row"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-[18px] border border-white/20 bg-white/5 px-5 py-3 font-sans text-sm text-on-secondary placeholder:text-on-secondary-muted transition-colors focus:border-white/40 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-[18px] bg-primary px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {status === "loading" ? "Signing up…" : "Sign up"}
      </button>
      {status === "error" && (
        <p className="font-sans text-xs text-error sm:absolute" role="alert">
          Something went wrong — try again.
        </p>
      )}
    </form>
  );
}
