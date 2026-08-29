/**
 * Design-system preview — a working reference for the DJDN visual identity,
 * not a real page. Delete once the homepage lands. It exists so the tokens,
 * type scale, and the primary/secondary relationship can be judged with the
 * actual fonts loaded before the full page set is built.
 */

const swatches = [
  { name: "primary", label: "Burnt orange", hex: "#BA5624", note: "Accent only — CTAs, price, active states" },
  { name: "secondary", label: "Bottle green", hex: "#1F3D2B", note: "Grounding dark tone — header, footer, breaks" },
  { name: "background", label: "Warm cream", hex: "#FAF6EF", note: "Page ground" },
  { name: "surface", label: "Surface", hex: "#FFFFFF", note: "Cards, product tiles" },
  { name: "ink", label: "Ink", hex: "#1C1917", note: "Body text" },
  { name: "outline", label: "Outline", hex: "#E5DDD0", note: "Subtle borders" },
  { name: "error", label: "Error", hex: "#B3261E", note: "Validation, destructive" },
];

export default function DesignSystemPreview() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-muted">
        DJDN — visual identity
      </p>
      <h1 className="mt-4 max-w-3xl text-[length:var(--text-display)] leading-[1.02] tracking-[-0.02em]">
        A luxurious feel, earned through restraint.
      </h1>
      <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-ink-muted">
        No photography to lean on yet. The premium signal comes from typography,
        colour discipline, spacing and interaction — nothing decorative
        compensating for what isn&rsquo;t there.
      </p>

      <div className="mt-12 flex flex-wrap gap-3">
        <button className="rounded-full bg-primary px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-primary-hover">
          Shop Now
        </button>
        <button className="rounded-full border border-ink/20 px-6 py-3 font-sans text-sm font-medium text-ink transition-colors hover:border-ink/40">
          Explore the colony
        </button>
      </div>

      {/* Palette */}
      <section className="mt-20">
        <h2 className="text-2xl">Palette</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {swatches.map((s) => (
            <div key={s.name} className="overflow-hidden rounded-lg border border-outline bg-surface">
              <div
                className="h-24 w-full border-b border-outline"
                style={{ backgroundColor: s.hex }}
              />
              <div className="p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-sm font-medium">{s.label}</span>
                  <span className="font-sans text-xs text-ink-muted">{s.hex}</span>
                </div>
                <p className="mt-1 font-sans text-xs leading-relaxed text-ink-muted">
                  {s.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottle green doing real work */}
      <section className="mt-12 rounded-xl bg-secondary px-8 py-14 text-on-secondary">
        <h2 className="text-3xl text-on-secondary">Join our colony</h2>
        <p className="mt-3 max-w-md font-sans text-on-secondary-muted">
          Bottle green is the site&rsquo;s dark anchor — section breaks, header,
          footer — where a generic template would reach for black.
        </p>
        <form className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-full border border-white/20 bg-white/5 px-5 py-3 font-sans text-sm text-on-secondary placeholder:text-on-secondary-muted focus:border-white/40 focus:outline-none"
          />
          <button className="shrink-0 rounded-full bg-primary px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-primary-hover">
            Sign up
          </button>
        </form>
      </section>

      {/* Type scale */}
      <section className="mt-20">
        <h2 className="text-2xl">Typography</h2>
        <dl className="mt-6 divide-y divide-outline border-y border-outline">
          {[
            { role: "Display / Fraunces", cls: "font-serif text-[length:var(--text-display)] leading-none tracking-[-0.02em]", sample: "Considered" },
            { role: "H2 / Fraunces", cls: "font-serif text-3xl", sample: "Everyday wear, quietly made" },
            { role: "Product name / Fraunces", cls: "font-serif text-xl", sample: "The Weekday Overshirt" },
            { role: "Body / Inter", cls: "font-sans text-base leading-relaxed", sample: "Cut from a mid-weight cotton twill that softens with wear. Boxy through the body, with a slightly dropped shoulder." },
            { role: "UI / Inter medium", cls: "font-sans text-sm font-medium", sample: "Add to bag — ₦48,000" },
            { role: "Caption / Inter", cls: "font-sans text-xs uppercase tracking-[0.2em] text-ink-muted", sample: "Free returns within Nigeria" },
          ].map((row) => (
            <div key={row.role} className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr]">
              <dt className="font-sans text-xs uppercase tracking-[0.15em] text-ink-muted">
                {row.role}
              </dt>
              <dd className={row.cls}>{row.sample}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
