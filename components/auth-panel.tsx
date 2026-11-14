"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/browser";

/**
 * Account log in and sign up, in the same centred layout and outline buttons as
 * the rest of the site (Track order, Returns): Google first, then email and
 * password. Creating an account asks for a first and last name and a tick-box
 * agreeing to the Terms and Privacy policy. "Forgot your password?" sends a
 * reset link.
 *
 * After logging in or creating an account the customer goes back to `next`, the
 * page they were on (for example the cart), so they carry on where they
 * stopped. Checkout itself never needs an account.
 */
type View = "login" | "create" | "forgot";
type Status = "idle" | "loading" | "sent" | "confirm";

const INPUT =
  "w-full rounded-[18px] border border-outline bg-surface px-5 py-3 font-sans text-base text-ink placeholder:text-ink-muted transition-colors focus:border-primary aria-[invalid=true]:border-error";
const LABEL = "mb-2 block font-sans text-xs text-ink-muted";
const BUTTON =
  "rounded-[18px] border border-ink px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98] disabled:opacity-60";
const LINK =
  "text-ink underline underline-offset-4 transition-colors hover:text-primary";
const FIELD_ERROR = "mt-2 font-sans text-sm text-error";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
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
  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    // Once they start fixing a field, its error message has done its job.
    if (errors[key]) {
      setErrors((current) => {
        const rest = { ...current };
        delete rest[key];
        return rest;
      });
    }
  };

  // Checked when they leave the email field, so a typo shows up before they
  // reach the button. An empty field is left alone until they try to submit.
  function checkEmail() {
    const email = fields.email.trim();
    if (email && !EMAIL_PATTERN.test(email)) {
      setErrors((current) => ({ ...current, email: "Enter a valid email address." }));
    }
  }

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

  async function google() {
    setMessage(null);
    // On the sign-up view the tick-box covers Google too.
    if (view === "create" && !agreed) {
      setErrors({ agreed: "Please tick the box to continue." });
      return;
    }
    setErrors({});
    setStatus("loading");
    try {
      // Ask Supabase first. If Google isn't switched on, the redirect would
      // land on a raw error page on Supabase's own site.
      const response = await withTimeout(
        fetch(`${SUPABASE_URL}/auth/v1/settings`, {
          headers: { apikey: SUPABASE_ANON_KEY ?? "" },
        }),
      );
      const settings = response.ok ? await response.json() : null;
      if (!settings?.external?.google) {
        setStatus("idle");
        setMessage("Google sign-in isn’t switched on yet. Please use your email and password for now.");
        return;
      }
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) fail(error);
    } catch (caught) {
      fail(caught);
    }
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

  const done = status === "confirm" || status === "sent";
  const heading = done
    ? "Check your email"
    : view === "create"
      ? "Create an account"
      : view === "forgot"
        ? "Reset your password"
        : "Log in";
  const subtitle = done
    ? null
    : view === "create"
      ? "See your orders in one place. You don’t need an account to check out."
      : view === "forgot"
        ? "Enter your email and we’ll send you a link to choose a new password."
        : "See your orders and keep your details for next time.";

  return (
    <>
      <h1 className="text-center text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
        {heading}
      </h1>
      <p className="mb-10 mt-4 max-w-sm text-center font-sans text-sm leading-relaxed text-ink-muted">
        {subtitle}
      </p>

      <div className="w-full max-w-sm">
        {status === "confirm" && (
          <div role="status" className="text-center font-sans text-sm leading-relaxed text-ink">
            <p>We&rsquo;ve sent a link to {fields.email.trim()}.</p>
            <p className="mt-3 text-ink-muted">
              Click it once to confirm your account, then{" "}
              <button type="button" onClick={() => go("login")} className={LINK}>
                log in
              </button>
              .
            </p>
          </div>
        )}

        {status === "sent" && (
          <div role="status" className="text-center font-sans text-sm leading-relaxed text-ink">
            <p>
              If an account exists for {fields.email.trim()}, we&rsquo;ve sent a link
              to reset your password.
            </p>
            <p className="mt-3 text-ink-muted">
              <button type="button" onClick={() => go("login")} className={LINK}>
                Back to log in
              </button>
            </p>
          </div>
        )}

        {!done && (
          <>
            {view !== "forgot" && (
              <>
                <button
                  type="button"
                  onClick={google}
                  disabled={busy}
                  className={`flex w-full items-center justify-center gap-3 ${BUTTON}`}
                >
                  <GoogleMark />
                  Continue with Google
                </button>

                <div className="my-6 flex items-center gap-4 font-sans text-xs text-ink-muted">
                  <span className="h-px flex-1 bg-outline" />
                  or
                  <span className="h-px flex-1 bg-outline" />
                </div>
              </>
            )}

            <form onSubmit={submit} noValidate className="flex flex-col gap-5">
              {view === "create" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="auth-first" className={LABEL}>
                      First name
                    </label>
                    <input
                      id="auth-first"
                      name="given-name"
                      value={fields.firstName}
                      onChange={set("firstName")}
                      autoComplete="given-name"
                      aria-invalid={errors.firstName ? true : undefined}
                      className={INPUT}
                    />
                    {errors.firstName && <p className={FIELD_ERROR}>{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="auth-last" className={LABEL}>
                      Last name
                    </label>
                    <input
                      id="auth-last"
                      name="family-name"
                      value={fields.lastName}
                      onChange={set("lastName")}
                      autoComplete="family-name"
                      aria-invalid={errors.lastName ? true : undefined}
                      className={INPUT}
                    />
                    {errors.lastName && <p className={FIELD_ERROR}>{errors.lastName}</p>}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className={LABEL}>
                  Email
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  value={fields.email}
                  onChange={set("email")}
                  onBlur={checkEmail}
                  // "username" on log in lets the browser pair the email with the saved
                  // password; "email" elsewhere lets it suggest the address itself.
                  autoComplete={view === "login" ? "username" : "email"}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="you@example.com"
                  aria-invalid={errors.email ? true : undefined}
                  className={INPUT}
                />
                {errors.email && <p className={FIELD_ERROR}>{errors.email}</p>}
              </div>

              {view !== "forgot" && (
                <div>
                  <label htmlFor="auth-password" className={LABEL}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-password"
                      name="password"
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
                  {errors.password && <p className={FIELD_ERROR}>{errors.password}</p>}
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
                  {errors.agreed && <p className={FIELD_ERROR}>{errors.agreed}</p>}
                </div>
              )}

              <button type="submit" disabled={busy} className={`mt-1 ${BUTTON}`}>
                {busy
                  ? "One moment…"
                  : view === "create"
                    ? "Create an account"
                    : view === "forgot"
                      ? "Send reset link"
                      : "Log in"}
              </button>

              <p
                role="alert"
                className="min-h-6 text-center font-sans text-sm leading-relaxed text-error"
              >
                {message}
              </p>
            </form>

            <div className="mt-2 text-center font-sans text-sm text-ink-muted">
              {view === "login" && (
                <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <button type="button" onClick={() => go("forgot")} className={LINK}>
                    Forgot your password?
                  </button>
                  <button type="button" onClick={() => go("create")} className={LINK}>
                    Create an account
                  </button>
                </p>
              )}
              {view === "create" && (
                <p>
                  Already have an account?{" "}
                  <button type="button" onClick={() => go("login")} className={LINK}>
                    Log in
                  </button>
                </p>
              )}
              {view === "forgot" && (
                <p>
                  <button type="button" onClick={() => go("login")} className={LINK}>
                    Back to log in
                  </button>
                </p>
              )}
            </div>

            {view === "login" && (
              <p className="mt-8 text-center font-sans text-xs leading-relaxed text-ink-muted">
                By continuing with Google you agree to our{" "}
                <Link href="/policies/terms" target="_blank" className={LINK}>
                  Terms of service
                </Link>{" "}
                and{" "}
                <Link href="/policies/privacy" target="_blank" className={LINK}>
                  Privacy policy
                </Link>
                . You don&rsquo;t need an account to check out.
              </p>
            )}
          </>
        )}
      </div>
    </>
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

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}
