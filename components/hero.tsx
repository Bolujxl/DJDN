"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Homepage hero. Lives on cream — green is already doing its job in the
 * header/footer, and a green hero meant the whole first screen loaded solid
 * green (60/30/10: cream stays dominant). Two-column: copy on the left,
 * gallery on the right, generously padded top and bottom.
 *
 * The gallery is committed to editorial, not shoppable: campaign photos of
 * models with a lookbook-style credit line (what's being worn), but no
 * "New" tags, no prices, no links — that's shopping chrome, and it belongs
 * to the New Arrivals grid below, which actually has products. A caption
 * naming the look is just a credit line, the way a magazine spread would
 * run one; it doesn't turn the gallery into a shoppable surface.
 *
 * Aspect ratio is now a single `aspect-[3/4]` at every breakpoint (only
 * width varies) — the old version hard-coded independent width/height
 * pairs per breakpoint that didn't share a ratio, so the arch's proportions
 * silently drifted across screen sizes.
 *
 * The loop mechanism itself (triple-buffered track, debounced wraparound
 * correction) is left as-is on purpose. It renders 3x the DOM nodes a
 * tighter buffer would need, which is real waste — but it's also the
 * result of fixing two separate bugs (a grid-blowout and a smooth-scroll
 * race condition) validated by hand. Shrinking the buffer reopens the same
 * class of edge-case bug for a marginal DOM saving; not worth it here.
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
const AUTOPLAY_MS = 5500;

export function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

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

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const width = setWidth();
    track.scrollTo({ left: width + index * step(), behavior: "smooth" });
  }

  // Start centred in the middle copy so both directions have room to wrap into.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = setWidth();
  }, []);

  // Snap the scroll position back into the middle copy once it drifts out,
  // and track which real slide is currently frontmost for the dots.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let settleTimer: ReturnType<typeof setTimeout>;
    let rafId: number;

    function updateActiveIndex() {
      if (!track) return;
      const width = setWidth();
      if (width === 0) return;
      const stepPx = step();
      const positionInSet = ((track.scrollLeft - width) % width + width) % width;
      setActiveIndex(Math.round(positionInSet / stepPx) % SLIDES.length);
    }

    function onScroll() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveIndex);

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
      cancelAnimationFrame(rafId);
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
            Sophisticated clothing for men and women, made to move.
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

        {/* Gallery — autoplaying loop, every shot reachable, purely editorial */}
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
                  className="relative aspect-[3/4] w-[240px] shrink-0 snap-start overflow-hidden rounded-t-full rounded-b-lg bg-outline sm:w-[270px] lg:w-[300px]"
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="(max-width: 1024px) 45vw, 300px"
                    className="object-cover"
                    priority={copy === 1 && slide === SLIDES[0]}
                  />

                  {/* Credit line, not a product tag — a scrim keeps it legible over any photo */}
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
            className="absolute -left-4 top-1/2 flex -translate-y-1/2 rounded-full bg-surface p-2 text-ink shadow-[0_4px_16px_rgba(28,25,23,0.15)] transition-transform hover:scale-105 sm:p-2.5"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label="Next look"
            onClick={() => scroll(1)}
            className="absolute -right-4 top-1/2 flex -translate-y-1/2 rounded-full bg-surface p-2 text-ink shadow-[0_4px_16px_rgba(28,25,23,0.15)] transition-transform hover:scale-105 sm:p-2.5"
          >
            <ArrowIcon direction="right" />
          </button>

          {/* Pagination — the only signal (especially on mobile, where nothing else hints this scrolls) that there are 5 shots on a loop */}
          <div className="mt-4 flex justify-center gap-2">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Show look ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => scrollToIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-5 bg-ink" : "w-1.5 bg-ink/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
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
