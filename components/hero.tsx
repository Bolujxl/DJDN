"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * Homepage hero. Lives on cream — green is already doing its job in the
 * header/footer, and a green hero meant the whole first screen loaded solid
 * green (60/30/10: cream stays dominant). Two-column: copy on the left,
 * gallery on the right, generously padded top and bottom.
 *
 * The gallery shows real campaign photography — multiple shots visible at
 * once, arch-framed, autoplaying on a loop with visible prev/next controls
 * as a manual override. An earlier pass tried a hover-triggered card stack
 * (reactbits' "Stack") but that hid 80% of the photography behind an
 * undiscoverable interaction, which is exactly wrong for a fashion hero:
 * the photos are the strongest asset on the page and need to be seen.
 */
const SLIDES = [
  {
    src: "/brand/models/trucker-cap-brick-wall.jpg",
    alt: "Model wearing the DJDN trucker cap, boxy tee, and mesh shorts in bottle green",
    caption: "Trucker Cap & Boxy Tee — Bottle Green",
  },
  {
    src: "/brand/models/striped-shirt-sunflower-bouquet.jpg",
    alt: "Model wearing the DJDN weekend shirt in pistachio stripe",
    caption: "The Weekend Shirt — Pistachio Stripe",
  },
  {
    src: "/brand/models/trucker-cap-portrait-brick.jpg",
    alt: "Model wearing the DJDN trucker cap and tee in black",
    caption: "Trucker Cap & Tee — Black",
  },
  {
    src: "/brand/models/beanie-sunflower-tee.jpg",
    alt: "Model wearing the DJDN ribbed beanie and sunflower graphic tee",
    caption: "Ribbed Beanie & Graphic Tee — Sunflower",
  },
  {
    src: "/brand/models/bw-crochet-sunflower.jpg",
    alt: "Model wearing the DJDN boxy tee and mesh shorts",
    caption: "Boxy Tee & Mesh Shorts",
  },
];

const GAP_PX = 20;
const AUTOPLAY_MS = 4000;

// Track is rendered as three copies of SLIDES back to back — [prev][real][next].
// Scrolling always happens inside the middle copy; whenever the scroll
// position drifts into the prev or next copy, we jump by one copy-width with
// no animation (identical content on both sides, so the jump is invisible).
// That's what makes the loop actually infinite in both directions instead of
// dead-ending at the first or last real image.
export function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  function setWidth() {
    const track = trackRef.current;
    if (!track) return 0;
    const cards = track.querySelectorAll<HTMLElement>("[data-slide]");
    let width = 0;
    for (let i = 0; i < SLIDES.length; i++) {
      width += cards[i].getBoundingClientRect().width + GAP_PX;
    }
    return width;
  }

  function step() {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>("[data-slide]");
    return (card?.getBoundingClientRect().width ?? 260) + GAP_PX;
  }

  function scroll(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * step(), behavior: "smooth" });
  }

  // Start centred in the middle copy so both directions have room to wrap into.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = setWidth();
  }, []);

  // Snap the scroll position back into the middle copy once it drifts out.
  // Debounced until scrolling actually settles — correcting mid-scroll would
  // fight both the smooth-scroll animation and the browser's own scroll-snap
  // settling, which otherwise race each other and leave the track stuck.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let settleTimer: ReturnType<typeof setTimeout>;
    function onScroll() {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (!track) return;
        const width = setWidth();
        if (width === 0) return;
        if (track.scrollLeft < width * 0.5) {
          track.scrollLeft += width;
        } else if (track.scrollLeft >= width * 1.5) {
          track.scrollLeft -= width;
        }
      }, 120);
    }
    track.addEventListener("scroll", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      clearTimeout(settleTimer);
    };
  }, []);

  // Autoplay — advances on its own, pauses on hover/focus, off for reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!pausedRef.current) scroll(1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-background text-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-8 lg:py-32">
        {/* Copy */}
        <div className="lg:col-span-5">
          <h1 className="text-[length:var(--text-display)] leading-[1.02] tracking-[-0.02em] text-ink">
            Dress like you mean it.
          </h1>
          <p className="mt-6 max-w-md font-sans text-lg leading-relaxed text-ink-muted">
            Sophisticated, everyday clothing for men and women — made to move
            as fast as you do.
          </p>

          <div className="mt-9">
            <Link
              href="/shop"
              className="rounded-full bg-primary px-7 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Gallery — autoplaying loop, every shot reachable, nothing hidden behind hover */}
        <div
          className="relative min-w-0 lg:col-span-7"
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          onFocus={() => (pausedRef.current = true)}
          onBlur={() => (pausedRef.current = false)}
        >
          <div
            ref={trackRef}
            role="region"
            aria-label="Featured looks"
            tabIndex={0}
            className="flex w-full min-w-0 snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {[0, 1, 2].map((copy) =>
              SLIDES.map((slide) => (
                <div
                  key={`${copy}-${slide.src}`}
                  data-slide
                  className="relative h-[380px] w-[240px] shrink-0 snap-start overflow-hidden rounded-t-full rounded-b-lg bg-outline sm:h-[440px] sm:w-[270px] lg:h-[520px] lg:w-[300px]"
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="(max-width: 1024px) 45vw, 300px"
                    className="object-cover"
                    priority={copy === 1 && slide === SLIDES[0]}
                  />

                  <NewTag />

                  {/* Product caption — scrim keeps it legible over any photo */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent px-4 pb-4 pt-10">
                    <p className="font-sans text-xs font-medium text-white">
                      {slide.caption}
                    </p>
                  </div>
                </div>
              )),
            )}
          </div>

          <button
            type="button"
            aria-label="Previous look"
            onClick={() => scroll(-1)}
            className="absolute -left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-surface p-2.5 text-ink shadow-[0_4px_16px_rgba(28,25,23,0.15)] transition-transform hover:scale-105 sm:flex"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label="Next look"
            onClick={() => scroll(1)}
            className="absolute -right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-surface p-2.5 text-ink shadow-[0_4px_16px_rgba(28,25,23,0.15)] transition-transform hover:scale-105 sm:flex"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Hanging price-tag, pinned near the right edge of each photo — a small
 * physical detail (string + notched tag) rather than a flat pill, positioned
 * low enough to clear the arch's curved top.
 */
function NewTag() {
  return (
    <div className="absolute right-6 top-28 -rotate-6 sm:top-32 lg:top-36">
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

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={direction === "left" ? "rotate-180" : undefined}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
