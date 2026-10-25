import Image from "next/image";
import Link from "next/link";

import { NewsletterForm } from "./newsletter-form";

/**
 * Everything the header deliberately leaves out lives here — About, Careers,
 * Contact, Customer Care, Policies, Journal. That split is the point of the
 * nav structure: department shopping up top, everything else down here.
 * None of these routes exist yet; this is the sitemap taking shape before
 * the pages behind it get built.
 *
 * Full bottle-green fill here is intentional and brief-sanctioned — the
 * footer is one of only two places named for it (header, footer), unlike
 * the earlier hero mistake of filling a whole first screen with it. The
 * top border is a thin orange seam marking the cream/white → green
 * transition, instead of the color just slamming into place.
 */
const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "What's new", href: "/new-arrivals" },
      { label: "Men", href: "/shop/men" },
      { label: "Women", href: "/shop/women" },
    ],
  },
  {
    title: "Customer services",
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
    title: "Policies",
    links: [
      { label: "Privacy policy", href: "/policies/privacy" },
      { label: "Terms of service", href: "/policies/terms" },
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

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-primary bg-secondary text-on-secondary">
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="border-b border-white/10 pb-12">
          <p className="font-display text-2xl text-on-secondary sm:text-3xl">
            Join our colony
          </p>
          <p className="mt-4 max-w-md font-sans text-sm text-on-secondary-muted">
            New arrivals, restocks, and the occasional word from us. No more
            than that.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="font-sans text-xs text-on-secondary-muted">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => {
                  const className =
                    "font-sans text-sm text-on-secondary/90 transition-colors hover:text-primary";
                  return (
                    <li key={link.label}>
                      {link.href.startsWith("http") ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href} className={className}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col-reverse items-center gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
          <p className="font-sans text-xs text-on-secondary-muted">
            © {new Date().getFullYear()} DJDN. All rights reserved.
          </p>
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
