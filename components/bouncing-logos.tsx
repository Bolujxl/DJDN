"use client";

import { useEffect, useRef } from "react";

/**
 * Small DJDN logos drifting across their container and bouncing off its
 * edges, like an old screensaver. Drawn on one canvas so a handful of logos
 * costs next to nothing, and sized to the container rather than the window.
 * Smaller logos are fainter and slower, which gives the field some depth
 * without any of it competing with the content in front.
 *
 * Under reduced motion the logos are drawn once and stay put. The loop also
 * pauses while the canvas is off screen.
 */
const LOGO_SRC = "/brand/logo/djdn-logo.png";
const ASPECT = 1080 / 478;

type Logo = { x: number; y: number; vx: number; vy: number; w: number; h: number; a: number };

const COUNT = 9;

function spawn(width: number, height: number): Logo[] {
  return Array.from({ length: COUNT }, (_, i) => {
    // 0 (small, far) to 1 (large, near), spread evenly then shuffled by position.
    const depth = i / (COUNT - 1);
    const w = 44 + depth * 64;
    const h = w / ASPECT;
    const speed = 18 + depth * 32;
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * Math.max(width - w, 0),
      y: Math.random() * Math.max(height - h, 0),
      vx: Math.cos(angle) * speed || speed,
      vy: Math.sin(angle) * speed || speed,
      w,
      h,
      a: 0.07 + depth * 0.09,
    };
  });
}

export function BouncingLogos({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const image = new Image();
    let logos: Logo[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let visible = true;
    let loaded = false;

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (const logo of logos) {
        ctx!.globalAlpha = logo.a;
        ctx!.drawImage(image, logo.x, logo.y, logo.w, logo.h);
      }
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (logos.length === 0) logos = spawn(width, height);
      for (const logo of logos) {
        logo.x = Math.min(logo.x, Math.max(width - logo.w, 0));
        logo.y = Math.min(logo.y, Math.max(height - logo.h, 0));
      }
      if (loaded) draw();
    }

    function tick(now: number) {
      frame = 0;
      if (!visible) return;
      // Clamp the step so a backgrounded tab doesn't teleport the logos.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      for (const logo of logos) {
        logo.x += logo.vx * dt;
        logo.y += logo.vy * dt;
        if (logo.x <= 0 || logo.x + logo.w >= width) {
          logo.vx = -logo.vx;
          logo.x = Math.min(Math.max(logo.x, 0), Math.max(width - logo.w, 0));
        }
        if (logo.y <= 0 || logo.y + logo.h >= height) {
          logo.vy = -logo.vy;
          logo.y = Math.min(Math.max(logo.y, 0), Math.max(height - logo.h, 0));
        }
      }
      draw();
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (reduceMotion || !loaded || !visible || frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }

    image.onload = () => {
      loaded = true;
      draw();
      start();
    };
    image.src = LOGO_SRC;

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    visibilityObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
