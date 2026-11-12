"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/browser";

const INPUT =
  "w-full rounded-[18px] border border-outline bg-surface px-5 py-3 font-sans text-base text-ink placeholder:text-ink-muted transition-colors focus:border-primary aria-[invalid=true]:border-error";
const LABEL = "mb-2 block font-sans text-xs text-ink-muted";
const MIN_PASSWORD = 8;

/**
 * The page a "reset your password" email link lands on. By then the link has
 * already signed the customer in, so all that is left is choosing a password.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don’t match.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) {
        setBusy(false);
        setError(
          updateError.code === "same_password"
            ? "Choose a password you haven’t used before."
            : "Something went wrong. Please try again, or ask for a new link.",
        );
        return;
      }
      router.replace("/account");
      router.refresh();
    } catch {
      setBusy(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 flex max-w-md flex-col gap-5">
      <div>
        <label htmlFor="reset-password" className={LABEL}>
          New password
        </label>
        <input
          id="reset-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className={INPUT}
        />
        <p className="mt-2 font-sans text-xs text-ink-muted">At least {MIN_PASSWORD} characters.</p>
      </div>
      <div>
        <label htmlFor="reset-confirm" className={LABEL}>
          Confirm new password
        </label>
        <input
          id="reset-confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          aria-invalid={error ? true : undefined}
          className={INPUT}
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-[18px] bg-ink px-7 py-3.5 font-sans text-sm text-surface transition-colors hover:bg-primary active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "One moment…" : "Save new password"}
      </button>
      {error && (
        <p role="alert" className="font-sans text-sm leading-relaxed text-error">
          {error}
        </p>
      )}
    </form>
  );
}
