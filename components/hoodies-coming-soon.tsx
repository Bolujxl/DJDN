/**
 * Hoodies aren't shot yet, so this is a deliberate empty state rather than a
 * missing section. Left-aligned and typographic to match the editorial
 * sections above it. Uses the same section padding and title size as the
 * rest of the page, with no hairline (the cream-on-cream seam is spacing).
 */
export function HoodiesComingSoon() {
  return (
    <section className="bg-surface py-16 lg:py-24">
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-6xl">
          Hoodies
        </h2>
        <p className="font-sans text-sm text-ink-muted">Coming soon.</p>
      </div>
    </section>
  );
}
