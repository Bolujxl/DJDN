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
  { src: "/brand/models/trucker-cap-brick-wall.jpg", caption: "Trucker cap — brick wall" },
  { src: "/brand/models/striped-shirt-sunflower-bouquet.jpg", caption: "Striped shirt — sunflower bouquet" },
  { src: "/brand/models/trucker-cap-portrait-brick.jpg", caption: "Trucker cap — portrait" },
  { src: "/brand/models/beanie-sunflower-tee.jpg", caption: "Beanie — sunflower tee" },
  { src: "/brand/models/bw-crochet-sunflower.jpg", caption: "Crochet sunflower — b&w" },
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
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-ink-muted">
            DJDN — Men &amp; Women
          </p>
          <h1 className="mt-4 text-[length:var(--text-display)] leading-[1.02] tracking-[-0.02em] text-ink">
            Dress like you mean it.
          </h1>
          <p className="mt-6 max-w-md font-sans text-lg leading-relaxed text-ink-muted">
            Sophisticated, everyday clothing for men and women — made to move
            as fast as you do.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/shop"
              className="rounded-full bg-primary px-7 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Shop Now
            </Link>
            <Link
              href="/shop/men"
              className="font-sans text-sm font-medium text-ink/90 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink/50"
            >
              Shop Men
            </Link>
            <Link
              href="/shop/women"
              className="font-sans text-sm font-medium text-ink/90 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink/50"
            >
              Shop Women
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
                    alt={slide.caption}
                    fill
                    sizes="(max-width: 1024px) 45vw, 300px"
                    className="object-cover"
                    priority={copy === 1 && slide === SLIDES[0]}
                  />
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
