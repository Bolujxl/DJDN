/**
 * Hoodies aren't shot yet — a real section here (per user: "hoodies coming
 * soon") rather than skipping the category outright or padding it with the
 * few shirt/short photos we already used elsewhere.
 */
export function HoodiesComingSoon() {
  return (
    <section className="border-t border-outline bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">Hoodies</h2>
        <p className="mt-3 font-sans text-sm text-ink-muted">
          Coming soon.
        </p>
      </div>
    </section>
  );
}
