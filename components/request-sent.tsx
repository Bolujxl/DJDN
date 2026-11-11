"use client";

import { useState } from "react";

/** How long the confirmation stays before the form comes back by itself. */
const RESET_SECONDS = 30;

const delay = (seconds: number) =>
  ({ "--d": `${seconds}s` }) as React.CSSProperties;

/**
 * What a customer sees after sending the returns form or an order status
 * request: a green check that draws itself, their reference to copy, a short
 * "what happens next" line, and a hairline that counts down to the form
 * resetting (hover or focus pauses it). "Send another" resets straight away.
 * Under reduced motion there is no countdown, only the button.
 */
export function RequestSent({
  title,
  as: Heading = "h2",
  reference,
  steps,
  align = "start",
  onReset,
  resetLabel,
  children,
}: {
  title: string;
  /** "h1" when this replaces the whole page, "h2" when it sits inside one. */
  as?: "h1" | "h2";
  reference: string;
  /** Three short labels; the first is shown as done. */
  steps: [string, string, string];
  align?: "start" | "center";
  onReset: () => void;
  resetLabel: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const centered = align === "center";

  async function copy() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard access (older browser, blocked): the code is still on screen.
    }
  }

  return (
    <div
      role="status"
      className={`sent-card flex w-full max-w-sm flex-col ${
        centered ? "items-center text-center" : "items-start"
      }`}
    >
      <span
        aria-hidden="true"
        className="sent-disc flex size-14 items-center justify-center rounded-full bg-secondary"
      >
        <svg viewBox="0 0 24 24" className="size-8" fill="none">
          <path
            className="sent-check"
            d="M6 12.5l4 4L18.5 8"
            stroke="var(--color-on-secondary)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <Heading
        className={`hero-rise mt-6 leading-[0.95] tracking-[-0.045em] text-ink ${
          Heading === "h1" ? "text-5xl sm:text-6xl" : "text-4xl"
        }`}
        style={delay(0.12)}
      >
        {title}
      </Heading>

      <div
        className="hero-rise mt-8 inline-flex items-center gap-5 rounded-[18px] border border-outline bg-background-alt py-3 pl-5 pr-3"
        style={delay(0.22)}
      >
        <div className="text-left">
          <p className="font-sans text-xs text-ink-muted">Your reference</p>
          <p className="mt-1 text-2xl tabular-nums tracking-[0.08em] text-ink">
            {reference}
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="rounded-full border border-outline bg-surface px-4 py-2 font-sans text-xs text-ink transition-colors hover:border-ink active:scale-[0.97]"
        >
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div
        className="hero-rise mt-6 flex flex-col gap-3 font-sans text-sm leading-relaxed text-ink-muted"
        style={delay(0.32)}
      >
        {children}
      </div>

      <ol
        className="hero-rise mt-8 flex w-full flex-wrap gap-x-6 gap-y-2 border-t border-outline pt-6 font-sans text-xs"
        style={{ ...delay(0.42), justifyContent: centered ? "center" : "flex-start" }}
      >
        {steps.map((step, index) => (
          <li
            key={step}
            className={`flex items-center gap-2 ${
              index === 0 ? "text-ink" : "text-ink-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${
                index === 0 ? "bg-secondary" : "border border-ink-muted/60"
              }`}
            />
            {step}
          </li>
        ))}
      </ol>

      <div className="hero-rise mt-10 w-full" style={delay(0.52)}>
        <div
          aria-hidden="true"
          className="h-px w-full bg-outline motion-reduce:hidden"
        >
          <div
            className="sent-countdown h-px origin-left bg-ink/50"
            style={{ "--reset": `${RESET_SECONDS}s` } as React.CSSProperties}
            onAnimationEnd={onReset}
          />
        </div>
        <p className="mt-4 font-sans text-xs text-ink-muted">
          <span className="motion-reduce:hidden">
            This form resets in a moment.{" "}
          </span>
          <button
            type="button"
            onClick={onReset}
            className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
          >
            {resetLabel}
          </button>
        </p>
      </div>
    </div>
  );
}
