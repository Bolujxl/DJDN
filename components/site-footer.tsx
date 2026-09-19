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
      { label: "What's New", href: "/new-arrivals" },
      { label: "Men", href: "/shop/men" },
      { label: "Women", href: "/shop/women" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Shipping", href: "/customer-care#shipping" },
      { label: "Orders & Payment", href: "/customer-care#orders-and-payment" },
      { label: "Returns", href: "/customer-care#returns" },
      { label: "FAQ", href: "/customer-care#faq" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/policies/privacy" },
      { label: "Terms of Service", href: "/policies/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-primary bg-secondary text-on-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="border-b border-white/10 pb-12">
          <p className="font-display text-2xl text-on-secondary sm:text-3xl">
            Join our colony
          </p>
          <p className="mt-2 max-w-md font-sans text-sm text-on-secondary-muted">
            New arrivals, restocks, and the occasional word from us — no more
            than that.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-12 sm:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="font-sans text-xs uppercase tracking-[0.15em] text-on-secondary-muted">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-on-secondary/90 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
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
