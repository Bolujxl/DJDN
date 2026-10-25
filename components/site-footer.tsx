import Image from "next/image";
import Link from "next/link";

import { NewsletterForm } from "./newsletter-form";

/**
 * Newsletter-led footer (modelled on WeNatal): a big brand-voice headline with
 * the email field beside it, then four flat link columns (Follow has its own),
 * then one small line with the copyright and the legal links inline. The
 * header only carries shopping and the blog, so the service, company and
 * social links all live here. None of these routes exist yet; this is the
 * sitemap taking shape before the pages behind it get built.
 *
 * A very faint oversized logo sits behind everything as a watermark: about 96%
 * of the footer's width at ~4.5% opacity, so it gives the green some depth
 * without pulling attention from the content on top.
 *
 * Full bottle-green fill is intentional and brief-sanctioned (header and
 * footer are the only places named for it). The top border is a thin orange
 * seam marking the white to green transition.
 */
type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

const COLUMNS: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { label: "What's new", href: "/new-arrivals" },
      { label: "Men", href: "/shop/men" },
      { label: "Women", href: "/shop/women" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Customer care", href: "/customer-care" },
      { label: "Shipping", href: "/customer-care#shipping" },
      { label: "Orders & payment", href: "/customer-care#orders-and-payment" },
      { label: "Return policy", href: "/customer-care#returns" },
      { label: "FAQ", href: "/customer-care#faq" },
      { label: "My account", href: "/account" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact us", href: "/contact" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "Instagram", href: "https://instagram.com/djdn.ng" },
      { label: "TikTok", href: "https://www.tiktok.com/@djdn.ng" },
      { label: "X", href: "#" },
      { label: "WhatsApp", href: "#" },
    ],
  },
];

const LEGAL: FooterLink[] = [
  { label: "Privacy policy", href: "/policies/privacy" },
  { label: "Terms of service", href: "/policies/terms" },
];

const LINK_CLASS =
  "font-sans text-sm text-on-secondary/90 transition-colors hover:text-primary";

function FooterAnchor({ link }: { link: FooterLink }) {
  return link.href.startsWith("http") ? (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={LINK_CLASS}
    >
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={LINK_CLASS}>
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden border-t-2 border-primary bg-secondary text-on-secondary">
      {/* Watermark logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <Image
          src="/brand/logo/djdn-logo-white.png"
          alt=""
          width={1080}
          height={478}
          className="h-auto w-[96%] opacity-[0.045]"
        />
      </div>

      <div className="px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pb-10 lg:pt-24">
        {/* Newsletter lead */}
        <div className="grid gap-8 border-b border-white/10 pb-16 lg:grid-cols-2 lg:items-end lg:pb-24">
          <div>
            <h2 className="text-5xl leading-[0.95] tracking-[-0.045em] text-on-secondary sm:text-6xl">
              Join our colony
            </h2>
            <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-on-secondary-muted">
              New arrivals, restocks, and the occasional word from us. No more
              than that.
            </p>
          </div>
          <NewsletterForm />
        </div>

        {/* Four flat link columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-12 lg:grid-cols-4 lg:py-16">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="font-sans text-xs text-on-secondary-muted">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright and legal on one line */}
        <div className="flex flex-col-reverse items-start gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <p className="font-sans text-xs text-on-secondary-muted">
              © {new Date().getFullYear()} DJDN. All rights reserved.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {LEGAL.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-xs text-on-secondary-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Image
            src="/brand/logo/djdn-logo-white.png"
            alt="DJDN"
            width={1080}
            height={478}
            className="h-6 w-auto"
          />
        </div>
      </div>
    </footer>
  );
}
