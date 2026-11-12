"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/browser";

/**
 * Account log in and sign up, set out like about:blank: a short left column to
 * switch between "Log in" and "Create an account", and the form on the right.
 * Email and password, a "forgot your password?" link, and a tick-box that
 * records agreement to the Terms and Privacy policy when an account is made.
 *
 * After logging in or creating an account the customer goes back to `next`,
 * the page they were on (for example the cart), so they carry on where they
 * stopped. Checkout itself never needs an account.
 */
type View = "login" | "create" | "forgot";
type Status = "idle" | "loading" | "sent" | "confirm";

const INPUT =
  "w-full rounded-[18px] border border-outline bg-surface px-5 py-3 font-sans text-base text-ink placeholder:text-ink-muted transition-colors focus:border-primary aria-[invalid=true]:border-error";
const LABEL = "mb-2 block font-sans text-xs text-ink-muted";
const LINK =
  "text-ink underline underline-offset-4 transition-colors hover:text-primary";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/** Gives up waiting after 20 seconds, so a slow service never leaves a spinner. */
function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("slow")), 20000),
    ),
  ]);
}

export function AuthPanel({
  next,
  initialView = "login",
  linkFailed = false,
}: {
  /** A path on this site to return to after signing in. */
  next: string;
  initialView?: "login" | "create";
  linkFailed?: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialView);
  const [status, setStatus] = useState<Status>("idle");
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(
    linkFailed ? "That link didn’t work or has expired. Please try again." : null,
  );

  const busy = status === "loading";
  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  function go(nextView: View) {
    setView(nextView);
    setStatus("idle");
    setErrors({});
    setMessage(null);
  }

  function finish() {
    router.replace(next);
    router.refresh();
  }

  function fail(caught: unknown) {
    setStatus("idle");
    setMessage(
      caught instanceof Error && caught.message === "slow"
        ? "This is taking longer than usual. Please try again in a moment."
        : "Something went wrong. Please try again.",
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const found: Record<string, string> = {};
    const email = fields.email.trim();
    if (!EMAIL_PATTERN.test(email)) found.email = "Enter a valid email address.";
    if (view !== "forgot") {
      if (!fields.password) found.password = "Enter your password.";
      else if (view === "create" && fields.password.length < MIN_PASSWORD) {
        found.password = `Use at least ${MIN_PASSWORD} characters.`;
      }
    }
    if (view === "create") {
      if (!fields.firstName.trim()) found.firstName = "Enter your first name.";
      if (!fields.lastName.trim()) found.lastName = "Enter your last name.";
      if (!agreed) found.agreed = "Please tick the box to continue.";
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("loading");
    const supabase = createClient();
    const origin = window.location.origin;

    try {
      if (view === "login") {
        const { error } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password: fields.password }),
        );
        if (!error) return finish();
        setStatus("idle");
        if (error.code === "invalid_credentials") {
          setMessage("That email and password don’t match. Check them and try again.");
        } else if (error.code === "email_not_confirmed") {
          setMessage("Please confirm your email first. We sent you a link when you created the account.");
        } else if (error.status === 429) {
          setMessage("Too many attempts. Please wait a few minutes and try again.");
        } else setMessage("Something went wrong. Please try again.");
        return;
      }

      if (view === "create") {
        const firstName = fields.firstName.trim();
        const lastName = fields.lastName.trim();
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password: fields.password,
            options: {
              emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
              data: {
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`,
                // When they ticked the box agreeing to the Terms and Privacy policy.
                terms_accepted_at: new Date().toISOString(),
              },
            },
          }),
        );
        if (error) {
          setStatus("idle");
          if (error.code === "user_already_exists") {
            setMessage("An account with this email already exists. Log in instead.");
          } else if (error.code === "weak_password") {
            setErrors({ password: `Choose a stronger password of at least ${MIN_PASSWORD} characters.` });
          } else if (error.status === 429) {
            setMessage("Too many attempts. Please wait a few minutes and try again.");
          } else setMessage("Something went wrong. Please try again.");
          return;
        }
        // A session means no email check is switched on, so they are in now.
        if (data.session) return finish();
        setStatus("confirm");
        return;
      }

      // Forgot password: the same reply whether or not the email has an account.
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/account/reset`,
        }),
      );
      if (error?.status === 429) {
        setStatus("idle");
        setMessage("We’ve sent a few links already. Please wait a few minutes before asking again.");
        return;
      }
      setStatus("sent");
    } catch (caught) {
      fail(caught);
    }
  }

  const heading =
    view === "create"
      ? "Create an account"
      : view === "forgot"
        ? "Reset your password"
        : "Log in";

  const navItem = (target: "login" | "create", label: string) =>
    view === target ? (
      <span className="text-ink-muted">/ {label}</span>
    ) : (
      <button
        type="button"
        onClick={() => go(target)}
        className="text-left text-ink transition-colors hover:text-primary"
      >
        {label}
      </button>
    );

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <nav
        aria-label="Account"
        className="flex flex-col items-start gap-2 font-sans text-sm lg:col-span-3"
      >
        {navItem("login", "Log in")}
        {navItem("create", "Create an account")}
      </nav>

      <div className="lg:col-span-6">
        <h1 className="text-4xl leading-[0.95] tracking-[-0.04em] text-ink sm:text-5xl">
          {heading}
        </h1>

        {view === "create" && status !== "confirm" && (
          <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
            See your orders in one place. You don&rsquo;t need an account to check
            out.
          </p>
        )}
        {view === "forgot" && status !== "sent" && (
          <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-ink-muted">
            Enter your email and we&rsquo;ll send you a link to choose a new
            password.
          </p>
        )}

        {status === "confirm" ? (
          <div role="status" className="mt-8 max-w-md font-sans text-sm leading-relaxed text-ink">
            <p>Check your email. We&rsquo;ve sent a link to {fields.email.trim()}.</p>
            <p className="mt-3 text-ink-muted">
              Click it once to confirm your account, then{" "}
              <button type="button" onClick={() => go("login")} className={LINK}>
                log in
              </button>
              .
            </p>
          </div>
        ) : status === "sent" ? (
          <div role="status" className="mt-8 max-w-md font-sans text-sm leading-relaxed text-ink">
            <p>
              If an account exists for {fields.email.trim()}, we&rsquo;ve sent a
              link to reset your password.
            </p>
            <p className="mt-3 text-ink-muted">
              <button type="button" onClick={() => go("login")} className={LINK}>
                Back to log in
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-8 flex max-w-md flex-col gap-5">
            {view === "create" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="auth-first" className={LABEL}>
                    First name
                  </label>
                  <input
                    id="auth-first"
                    value={fields.firstName}
                    onChange={set("firstName")}
                    autoComplete="given-name"
                    aria-invalid={errors.firstName ? true : undefined}
                    className={INPUT}
                  />
                  {errors.firstName && <p className="mt-2 font-sans text-sm text-error">{errors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="auth-last" className={LABEL}>
                    Last name
                  </label>
                  <input
                    id="auth-last"
                    value={fields.lastName}
                    onChange={set("lastName")}
                    autoComplete="family-name"
                    aria-invalid={errors.lastName ? true : undefined}
                    className={INPUT}
                  />
                  {errors.lastName && <p className="mt-2 font-sans text-sm text-error">{errors.lastName}</p>}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className={LABEL}>
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={fields.email}
                onChange={set("email")}
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                className={INPUT}
              />
              {errors.email && <p className="mt-2 font-sans text-sm text-error">{errors.email}</p>}
            </div>

            {view !== "forgot" && (
              <div>
                <label htmlFor="auth-password" className={LABEL}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={fields.password}
                    onChange={set("password")}
                    autoComplete={view === "create" ? "new-password" : "current-password"}
                    aria-invalid={errors.password ? true : undefined}
                    className={`${INPUT} pr-14`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink"
                  >
                    <EyeIcon off={showPassword} />
                  </button>
                </div>
                {errors.password && <p className="mt-2 font-sans text-sm text-error">{errors.password}</p>}
                {view === "create" && !errors.password && (
                  <p className="mt-2 font-sans text-xs text-ink-muted">At least {MIN_PASSWORD} characters.</p>
                )}
              </div>
            )}

            {view === "create" && (
              <div>
                <label className="flex items-start gap-3 font-sans text-sm leading-relaxed text-ink-muted">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    aria-invalid={errors.agreed ? true : undefined}
                    className="mt-1 size-4 shrink-0 accent-ink"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/policies/terms" target="_blank" className={LINK}>
                      Terms of service
                    </Link>{" "}
                    and the{" "}
                    <Link href="/policies/privacy" target="_blank" className={LINK}>
                      Privacy policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.agreed && <p className="mt-2 font-sans text-sm text-error">{errors.agreed}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-[18px] bg-ink px-7 py-3.5 font-sans text-sm text-surface transition-colors hover:bg-primary active:scale-[0.98] disabled:opacity-60"
            >
              {busy
                ? "One moment…"
                : view === "create"
                  ? "Create an account"
                  : view === "forgot"
                    ? "Send reset link"
                    : "Log in"}
            </button>

            {message && (
              <p role="alert" className="font-sans text-sm leading-relaxed text-error">
                {message}
              </p>
            )}

            <p className="font-sans text-sm text-ink-muted">
              {view === "login" && (
                <>
                  <button type="button" onClick={() => go("forgot")} className={LINK}>
                    Forgot your password?
                  </button>
                  <span className="mx-3" aria-hidden="true" />
                  <button type="button" onClick={() => go("create")} className={LINK}>
                    Create an account
                  </button>
                </>
              )}
              {view === "create" && (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => go("login")} className={LINK}>
                    Log in
                  </button>
                </>
              )}
              {view === "forgot" && (
                <button type="button" onClick={() => go("login")} className={LINK}>
                  Back to log in
                </button>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}
