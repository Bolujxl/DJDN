/**
 * Hoodies aren't shot yet, so this is a deliberate empty state rather than a
 * missing section. Left-aligned and typographic to match the editorial
 * sections above it instead of a centered placeholder.
 */
export function HoodiesComingSoon() {
  return (
    <section className="border-t border-outline bg-background">
      <div className="flex items-end justify-between px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h2 className="text-5xl leading-[0.95] tracking-[-0.045em] text-ink sm:text-7xl">
          Hoodies
        </h2>
        <p className="font-sans text-sm text-ink-muted">Coming soon.</p>
      </div>
    </section>
  );
}
