"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Price filter: a "Price" chip in the toolbar that opens a small panel with
 * two amount fields and a two-handle slider. The slider is two native range
 * inputs laid over one track (so keyboard, touch and screen readers all work
 * for free); the handle styling lives in globals.css under `.dual-range`.
 *
 * Amounts here are whole naira. `value` is null while nothing is filtered, so
 * dragging both handles back to the ends clears the filter.
 */
export type PriceRange = [number, number];

/** Slider granularity, in naira. */
const STEP = 100;

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

export function PriceRangeFilter({
  bounds,
  value,
  onChange,
  chipClass,
}: {
  bounds: PriceRange;
  value: PriceRange | null;
  onChange: (next: PriceRange | null) => void;
  chipClass: (active: boolean) => string;
}) {
  const [open, setOpen] = useState(false);
  // What's being typed in each field, until it's committed on blur or Enter.
  const [draft, setDraft] = useState<{ lo: string | null; hi: string | null }>({
    lo: null,
    hi: null,
  });
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  const [min, max] = bounds;
  const [lo, hi] = value ?? bounds;
  const active = value !== null;

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function commit(nextLo: number, nextHi: number) {
    onChange(nextLo <= min && nextHi >= max ? null : [nextLo, nextHi]);
  }

  function commitTyped(which: "lo" | "hi") {
    const raw = draft[which];
    setDraft((d) => ({ ...d, [which]: null }));
    if (raw === null) return;
    const typed = parseInt(raw.replace(/\D/g, ""), 10);
    if (Number.isNaN(typed)) return;
    if (which === "lo") commit(Math.min(Math.max(typed, min), hi), hi);
    else commit(lo, Math.max(Math.min(typed, max), lo));
  }

  const pct = (n: number) => ((n - min) / (max - min)) * 100;

  const field = (which: "lo" | "hi", current: number, label: string) => (
    <label className="flex-1">
      <span className="sr-only">{label}</span>
      <span className="flex items-center gap-1 rounded-[18px] border border-outline bg-surface px-4 py-2.5 transition-colors focus-within:border-primary">
        <span aria-hidden="true" className="font-sans text-base text-ink-muted">
          ₦
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={draft[which] ?? current.toLocaleString("en-NG")}
          onFocus={(e) => e.target.select()}
          onChange={(e) =>
            setDraft((d) => ({ ...d, [which]: e.target.value }))
          }
          onBlur={() => commitTyped(which)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitTyped(which);
          }}
          className="w-full min-w-0 bg-transparent text-right font-sans text-base tabular-nums text-ink"
        />
      </span>
    </label>
  );

  return (
    <span ref={wrapRef} className="contents">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={chipClass(active || open)}
      >
        {active ? `${naira(lo)} to ${naira(hi)}` : "Price"}
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label="Price range"
          className="popup-in absolute left-4 top-full z-20 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-outline bg-surface p-5 shadow-[0_16px_32px_-12px_rgba(28,25,23,0.14)] sm:left-6 lg:left-8"
        >
          <div className="flex items-center gap-3">
            {field("lo", lo, "Lowest price")}
            <span aria-hidden="true" className="text-ink-muted">
              –
            </span>
            {field("hi", hi, "Highest price")}
          </div>

          <div className="dual-range relative mx-3.5 mt-6 h-7">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-outline"
            />
            <div
              aria-hidden="true"
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink"
              style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
            />
            <input
              type="range"
              aria-label="Lowest price"
              min={min}
              max={max}
              step={STEP}
              value={lo}
              onChange={(e) =>
                commit(Math.min(Number(e.target.value), hi - STEP), hi)
              }
              // Lift this handle when both sit at the right end, so it can still be grabbed.
              style={{ zIndex: lo > (min + max) / 2 ? 4 : 2 }}
            />
            <input
              type="range"
              aria-label="Highest price"
              min={min}
              max={max}
              step={STEP}
              value={hi}
              onChange={(e) =>
                commit(lo, Math.max(Number(e.target.value), lo + STEP))
              }
              style={{ zIndex: 3 }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between font-sans text-xs text-ink-muted">
            <span>
              {naira(min)} to {naira(max)}
            </span>
            {active && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
