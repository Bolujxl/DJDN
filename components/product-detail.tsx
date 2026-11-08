"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CATEGORY_LABELS, type Product } from "@/lib/catalogue";

import { useCart } from "./cart-provider";
import { Price } from "./country-provider";

/**
 * Product page. Photos run down the left, flush, with the bare product on
 * white shown whole and the model photo filling its frame. The details panel
 * sits on the right and stays in view while the photos scroll: name and price
 * on one line, colour, a row of bordered size cells, one wide outlined button,
 * the description, then collapsible sections (about:blank and Rains both use
 * this pattern). Adding without a size asks for one instead of failing
 * silently.
 */
export function ProductDetail({ product }: { product: Product }) {
  const { add } = useCart();
  const [colourIndex, setColourIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [needSize, setNeedSize] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);

  // Phones get a bar pinned to the bottom with the add button whenever the main
  // one is off screen, so there's no scrolling back up through the photos. It
  // steps aside once the footer comes into view.
  useEffect(() => {
    const button = addRef.current;
    const footer = document.querySelector("footer");
    if (!button) return;
    let buttonInView = true;
    let footerInView = false;
    const update = () => setBarVisible(!buttonInView && !footerInView);
    const buttonObserver = new IntersectionObserver(([entry]) => {
      buttonInView = entry.isIntersecting;
      update();
    });
    const footerObserver = new IntersectionObserver(([entry]) => {
      footerInView = entry.isIntersecting;
      update();
    });
    buttonObserver.observe(button);
    if (footer) footerObserver.observe(footer);
    return () => {
      buttonObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  const colourway = product.colourways[colourIndex];
  const images = [colourway.look, colourway.product].filter(
    (src): src is string => Boolean(src),
  );

  function onAdd() {
    if (!size) {
      setNeedSize(true);
      return;
    }
    add({ slug: product.slug, colour: colourway.name, size });
  }

  // From the pinned bar: with no size chosen yet, take the shopper to the sizes.
  function onAddFromBar() {
    if (!size) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sizeRef.current?.scrollIntoView({
        block: "center",
        behavior: reduce ? "auto" : "smooth",
      });
    }
    onAdd();
  }

  return (
    <section className="bg-surface">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {images.map((src, index) => (
            <div
              key={src}
              className="relative aspect-[4/5] border-b border-outline bg-surface"
            >
              <Image
                src={src}
                alt={`${product.name}, ${colourway.name}${
                  src === colourway.product ? ", product only" : ""
                }`}
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className={
                  src === colourway.product
                    ? "object-contain p-[3%]"
                    : "object-cover"
                }
              />
            </div>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="px-4 py-10 sm:px-6 lg:sticky lg:top-24 lg:px-12 lg:py-12">
            <nav aria-label="Breadcrumb" className="font-sans text-sm text-ink-muted">
              <ol className="flex flex-wrap items-center gap-x-2">
                <li>
                  <Link href="/shop" className="transition-colors hover:text-ink">
                    Shop
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/shop/${product.departments[0]}/${
                      product.category === "headgear"
                        ? "head-gear"
                        : product.category
                    }`}
                    className="transition-colors hover:text-ink"
                  >
                    {CATEGORY_LABELS[product.category]}
                  </Link>
                </li>
              </ol>
            </nav>

            <div className="mt-8 flex items-baseline justify-between gap-6">
              <h1 className="text-3xl leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
                {product.name}
              </h1>
              <p className="shrink-0 font-sans text-lg font-medium tabular-nums text-ink">
                <Price kobo={product.price} />
              </p>
            </div>

            <div className="mt-8">
              <p className="font-sans text-sm text-ink-muted">
                Colour <span className="text-ink">{colourway.name}</span>
              </p>
              <div className="mt-3 flex gap-1">
                {product.colourways.map((c, index) => (
                  <button
                    key={c.name}
                    type="button"
                    aria-label={c.name}
                    aria-pressed={index === colourIndex}
                    onClick={() => setColourIndex(index)}
                    className="flex h-11 w-11 items-center justify-center"
                  >
                    <span
                      style={{ backgroundColor: c.swatch }}
                      className={`block h-5 w-5 rounded-full border border-ink/20 transition-shadow ${
                        index === colourIndex
                          ? "ring-1 ring-ink ring-offset-2 ring-offset-surface"
                          : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div ref={sizeRef} className="mt-8 scroll-mt-28">
              <p className="font-sans text-sm text-ink-muted">Size</p>
              <div
                role="group"
                aria-label="Size"
                className="mt-3 grid border border-outline"
                style={{
                  gridTemplateColumns: `repeat(${product.sizes.length}, minmax(0, 1fr))`,
                }}
              >
                {product.sizes.map((value, index) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={size === value}
                    onClick={() => {
                      setSize(value);
                      setNeedSize(false);
                    }}
                    className={`h-12 font-sans text-sm transition-colors ${
                      index > 0 ? "border-l border-outline" : ""
                    } ${
                      size === value
                        ? "bg-ink text-surface"
                        : "text-ink hover:bg-background"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p
                role="alert"
                className="mt-3 h-5 font-sans text-sm text-error"
              >
                {needSize ? "Select a size to continue." : ""}
              </p>
            </div>

            <button
              ref={addRef}
              type="button"
              onClick={onAdd}
              className="mt-2 w-full rounded-[18px] border border-ink px-7 py-3.5 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98]"
            >
              Add to cart
            </button>

            <p className="mt-8 font-sans text-sm leading-relaxed text-ink">
              {product.description}
            </p>

            <div className="mt-10 border-t border-outline">
              <Section title="Details">
                <ul className="space-y-2">
                  {product.details.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </Section>
              <Section title="Size and fit">
                <p>
                  Available in {product.sizes[0]} to{" "}
                  {product.sizes[product.sizes.length - 1]}. A full size guide is
                  coming soon.
                </p>
              </Section>
              <Section title="Delivery and returns">
                <p>
                  See our{" "}
                  <Link
                    href="/customer-care#shipping"
                    className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    shipping
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/returns"
                    className="text-ink underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    return policy
                  </Link>
                  .
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>

      {barVisible && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-outline bg-surface/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:hidden">
          <div className="min-w-0 flex-1 font-sans text-sm">
            <p className="truncate text-ink">{product.name}</p>
            <p className="tabular-nums text-ink-muted">
              <Price kobo={product.price} />
            </p>
          </div>
          <button
            type="button"
            onClick={onAddFromBar}
            className="shrink-0 rounded-[18px] border border-ink px-6 py-3 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98]"
          >
            {size ? "Add to cart" : "Select a size"}
          </button>
        </div>
      )}
    </section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-outline">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-sans text-sm text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden="true"
          className="text-lg leading-none text-ink-muted transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
        >
          +
        </span>
      </summary>
      <div className="pb-5 font-sans text-sm leading-relaxed text-ink-muted">
        {children}
      </div>
    </details>
  );
}
