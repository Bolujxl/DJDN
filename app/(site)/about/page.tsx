import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About us",
  description:
    "DJDN is a Nigeria-based fashion brand that promotes African contemporary lifestyle.",
};

/**
 * About page, set in the brand's own words. The layout follows the editorial
 * direction used on the homepage (Rains, about:blank): big tight headlines,
 * flush photography, small captions and plenty of white space. The copy is the
 * founder's text, split into short beats so each gets room; only punctuation
 * and capitalisation were tidied. Server component, no JS.
 */
const CAPTION =
  "absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink/60 to-transparent px-3 pb-3 pt-10 font-sans text-xs text-white sm:px-4 sm:pb-4";

const LABEL = "font-sans text-xs text-ink-muted";

const STATEMENT =
  "text-3xl leading-[1.08] tracking-[-0.035em] text-ink sm:text-5xl lg:text-6xl";

const BODY = "font-sans text-sm leading-relaxed text-ink-muted";

export default function AboutPage() {
  return (
    <>
      {/* Opening: the one-line description, beside a full-height portrait. */}
      <section className="grid min-h-[calc(100svh-5rem)] grid-cols-1 bg-background text-ink lg:grid-cols-12">
        <div className="flex flex-col justify-end px-4 py-10 sm:px-6 lg:col-span-6 lg:px-8 lg:py-12">
          <p className={`hero-rise ${LABEL}`}>About us</p>
          <h1 className="hero-rise mt-6 text-display text-ink [--d:0.07s]">
            <span className="block">African</span>
            <span className="block">contemporary</span>
            <span className="block">lifestyle</span>
          </h1>
          <p className="hero-rise mt-8 max-w-sm font-sans text-sm leading-relaxed text-ink-muted [--d:0.16s]">
            DJDN is a Nigeria-based fashion brand that promotes African
            contemporary lifestyle.
          </p>
        </div>

        <figure className="relative h-[34rem] overflow-hidden sm:h-[44rem] lg:col-span-6 lg:h-auto">
          <Image
            src="/brand/lookbook/banner-dynamic-crouch.jpg"
            alt="Model crouched on a sage green plinth in a black DJDN sleeveless tee, with crochet sunflowers at the base"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="hero-settle object-cover object-top"
          />
          <figcaption className={CAPTION}>DJDN, Nigeria</figcaption>
        </figure>
      </section>

      {/* Belief: fashion as a lifestyle and a way to say who you are. */}
      <section className="bg-surface px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <p className={LABEL}>What fashion means to us</p>
        <p className={`mt-6 max-w-4xl ${STATEMENT}`}>
          Fashion has always been about more than what you wear.
        </p>
        <div className="mt-16 grid gap-8 border-t border-outline pt-8 lg:mt-24 lg:grid-cols-12">
          <p className={`${LABEL} lg:col-span-4`}>Self-expression</p>
          <div className="space-y-5 lg:col-span-5 lg:col-start-7">
            <p className={BODY}>
              It is a lifestyle. It is about who you are, what you represent,
              and the stories you carry with you.
            </p>
            <p className={BODY}>
              It is a form of self-expression, a reflection of identity, and a
              way of connecting with people beyond words.
            </p>
          </div>
        </div>
      </section>

      {/* Two portraits, flush, as a pause between the beliefs. */}
      <section className="grid grid-cols-2 border-y border-outline bg-surface">
        <figure className="relative aspect-[4/5] overflow-hidden border-r border-outline">
          <Image
            src="/brand/models/trucker-cap-portrait-brick.jpg"
            alt="Model in a black and white DJDN trucker cap and black tee against an orange brick wall"
            fill
            sizes="50vw"
            className="object-cover"
          />
          <figcaption className={CAPTION}>Trucker cap</figcaption>
        </figure>
        <figure className="relative aspect-[4/5] overflow-hidden">
          <Image
            src="/brand/models/beanie-sunflower-tee.jpg"
            alt="Model looking down in a black DJDN embroidered beanie and a white tee with a sunflower print"
            fill
            sizes="50vw"
            className="object-cover"
          />
          <figcaption className={CAPTION}>Embroidered beanie</figcaption>
        </figure>
      </section>

      {/* The bridge: the mission and who it is for. */}
      <section className="bg-background px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <p className={LABEL}>What we&rsquo;re building</p>
        <p className={`mt-6 max-w-5xl ${STATEMENT}`}>
          A cultural bridge where people from different backgrounds,
          communities, and parts of the world can celebrate their differences
          through a common love for fashion and culture.
        </p>

        <div className="mt-20 grid gap-8 border-t border-outline pt-8 lg:grid-cols-12 lg:mt-28">
          <p className={`${LABEL} lg:col-span-4`}>Who it&rsquo;s for</p>
          <div className="space-y-5 lg:col-span-6 lg:col-start-7">
            <p className="font-sans text-base leading-relaxed text-ink">
              DJDN is for those who believe you don&rsquo;t have to share the
              same background, speak the same language, or come from the same
              culture to be part of what we&rsquo;re building.
            </p>
            <p className="font-sans text-base leading-relaxed text-ink">
              All you need is an appreciation for individuality, creativity,
              and meaningful connections.
            </p>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-4 lg:mt-28">
          <Link
            href="/shop"
            className="inline-block rounded-[18px] border border-ink px-7 py-3 font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98]"
          >
            Shop Now
          </Link>
          <Link
            href="/customer-care#contact"
            className="font-sans text-sm text-ink underline underline-offset-4 transition-colors hover:text-primary"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
