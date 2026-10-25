"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Photo settle: the photo starts 4% larger and eases to full size the first
 * time it scrolls into view, then stays put. It fills its (clipped) parent, so
 * nothing moves on the page and no text shifts. Plays once and never
 * reverses. Only `scale` is animated. Under reduced motion it renders at full
 * size with no transition; with no JS it simply shows the slightly larger
 * photo, so nothing is ever hidden.
 */
export function Settle({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSettled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSettled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`absolute inset-0 transition-transform duration-700 ease-out motion-reduce:transition-none ${
        settled ? "scale-100" : "scale-[1.04]"
      }`}
    >
      {children}
    </div>
  );
}
