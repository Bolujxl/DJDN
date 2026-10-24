import Image from "next/image";
import Link from "next/link";

/**
 * Editorial hero: two portraits flush against each other and the viewport
 * edge, huge tight type beside them, captions in small utility type. No
 * carousel, arrows, dots, cards or radii. Static on purpose, which also makes
 * this a server component with no JS.
 */
const LOOKS = [
  {
    src: "/brand/models/bw-crochet-sunflower.jpg",
    alt: "Model in a black DJDN boxy tee and mesh shorts, holding a crochet sunflower",
    caption: "Boxy tee & mesh shorts",
  },
  {
    src: "/brand/models/striped-shirt-sunflower-bouquet.jpg",
    alt: "Model wearing the DJDN weekend shirt in pistachio stripe",
    caption: "The weekend shirt, pistachio stripe",
  },
];

export function Hero() {
  return (
    <section className="grid min-h-[calc(100svh-5rem)] grid-cols-1 bg-background text-ink lg:grid-cols-12">
      <div className="flex flex-col justify-end px-4 py-10 sm:px-6 lg:col-span-5 lg:px-8 lg:py-12">
        <div>
          <h1 className="text-[length:clamp(3.25rem,6.2vw,6.25rem)] leading-[0.92] tracking-[-0.05em] text-ink">
            Dress like you mean it.
          </h1>
          <p className="mt-8 max-w-xs font-sans text-sm leading-relaxed text-ink-muted">
            Sophisticated clothing for men and women, made to move.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-[18px] bg-primary px-7 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-primary-hover active:scale-[0.98]"
          >
            Shop Now
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:col-span-7">
        {LOOKS.map((look, index) => (
          <figure key={look.src} className="relative">
            <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full">
              <Image
                src={look.src}
                alt={look.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 29vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent px-3 pb-3 pt-10 font-sans text-xs text-white sm:px-4 sm:pb-4">
              {look.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
