/**
 * Hanging price-tag — a small physical detail (string + notched tag) used
 * to flag new stock, rather than a flat pill. Shared by the hero gallery
 * and the New Arrivals product grid so it reads as one design-system
 * element, not a one-off.
 */
export function NewTag({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute -rotate-6 ${className}`}>
      <div className="mx-auto h-2.5 w-px bg-white/70" />
      <div
        className="flex h-11 w-9 flex-col items-center justify-center gap-1 bg-error shadow-[0_3px_10px_rgba(0,0,0,0.35)]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 72%, 50% 100%, 0 72%)" }}
      >
        <span className="h-1 w-1 rounded-full bg-white/90" />
        <span className="font-sans text-[9px] font-bold uppercase tracking-wide text-white">
          New
        </span>
      </div>
    </div>
  );
}
