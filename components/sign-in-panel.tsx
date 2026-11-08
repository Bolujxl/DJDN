"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/browser";

/**
 * Account sign-in: Google first, then an email link for anyone without one
 * (no passwords to store or forget). Checkout never needs this; it only
 * unlocks order history and saved addresses.
 */
export function SignInPanel({ failed = false }: { failed?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    failed ? "error" : "idle",
  );

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=/account`;

  async function google() {
    setStatus("loading");
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) setStatus("error");
  }

  async function emailLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo() },
    });
    setStatus(error ? "error" : "sent");
  }

  const busy = status === "loading";

  return (
    <div className="w-full max-w-sm">
      <button
        type="button"
        onClick={google}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-ink px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98] disabled:opacity-60"
      >
        <GoogleMark />
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-4 font-sans text-xs text-ink-muted">
        <span className="h-px flex-1 bg-outline" />
        or
        <span className="h-px flex-1 bg-outline" />
      </div>

      {status === "sent" ? (
        <p role="status" className="font-sans text-sm text-ink">
          Check your inbox. We&rsquo;ve sent a sign-in link to {email}.
        </p>
      ) : (
        <form onSubmit={emailLink} noValidate className="flex flex-col gap-3">
          <label htmlFor="account-email" className="sr-only">
            Email address
          </label>
          <input
            id="account-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-[18px] border border-outline bg-surface px-5 py-3 font-sans text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-[18px] border border-outline px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:border-ink disabled:opacity-60"
          >
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p role="alert" className="mt-4 font-sans text-sm text-error">
          Something went wrong. Please try again.
        </p>
      )}

      <p className="mt-8 font-sans text-xs leading-relaxed text-ink-muted">
        You don&rsquo;t need an account to check out. Signing in just keeps your
        orders in one place.
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}
