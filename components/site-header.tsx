"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Primary nav: shopping and content only (What's new, Men, Women, Blog), the
 * same on every screen size. Service, company and policy links live in the
 * footer, where shoppers look for them; keeping them out of the header keeps
 * the top bar quiet. A branch (Men, Women) opens a panel that draws its
 * children as an org chart (parent label, sub-branch title, then leaves
 * hanging off thin connector lines). Category links are placeholders
 * matching the shape of Sanity's `category` schema until the Studio has real
 * data.
 *
 * Colour: cream-dominant, with hairlines in `outline`. Orange appears only
 * as the hover colour on links.
 */
type NavLink = { label: string; href: string };
type NavGroup = { title?: string; links: NavLink[] };
type NavLeaf = { label: string; href: string; groups?: undefined };
type NavBranch = {
  label: string;
  href?: string;
  groups: NavGroup[];
  showAll?: boolean;
};
type NavItem = NavLeaf | NavBranch;

const NAV: NavItem[] = [
  { label: "What's new", href: "/new-arrivals" },
  {
    label: "Men",
    href: "/shop/men",
    showAll: true,
    groups: [
      {
        title: "Clothing",
        links: [
          { label: "Shirts", href: "/shop/men/shirts" },
          { label: "Trousers", href: "/shop/men/trousers" },
          { label: "Outerwear", href: "/shop/men/outerwear" },
          { label: "Knitwear", href: "/shop/men/knitwear" },
        ],
      },
      {
        title: "More",
        links: [
          { label: "Accessories", href: "/shop/men/accessories" },
          { label: "New arrivals", href: "/shop/men?sort=new" },
        ],
      },
    ],
  },
  {
    label: "Women",
    href: "/shop/women",
    showAll: true,
    groups: [
      {
        title: "Clothing",
        links: [
          { label: "Tops", href: "/shop/women/tops" },
          { label: "Trousers", href: "/shop/women/trousers" },
          { label: "Dresses", href: "/shop/women/dresses" },
          { label: "Outerwear", href: "/shop/women/outerwear" },
        ],
      },
      {
        title: "More",
        links: [
          { label: "Accessories", href: "/shop/women/accessories" },
          { label: "New arrivals", href: "/shop/women?sort=new" },
        ],
      },
    ],
  },
  { label: "Blog", href: "/blog" },
];

/** Org-chart rendering of a branch: groups side by side, leaves on connector lines. */
function NavTree({
  item,
  onNavigate,
}: {
  item: NavBranch;
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-6">
      {item.groups.map((group, index) => (
        <div key={group.title ?? index} className="min-w-[8rem]">
          {group.title && (
            <p className="font-sans text-xs text-ink-muted">{group.title}</p>
          )}
          <ul className={`border-l border-outline ${group.title ? "mt-2" : ""}`}>
            {group.links.map((link) => (
              <li
                key={link.href}
                className="relative pl-4 before:absolute before:left-0 before:top-1/2 before:w-2.5 before:border-t before:border-outline"
              >
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  className="block py-1.5 font-sans text-sm text-ink transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const [openDept, setOpenDept] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Close the mega-menu on outside click or Escape.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDept(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenDept(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-outline bg-background/75 text-ink backdrop-blur-md"
    >
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="-ml-2 rounded-full p-3 transition-colors hover:bg-secondary/8 lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Logo mark */}
        <Link
          href="/"
          className="transition-opacity hover:opacity-75 lg:flex-1"
          onClick={() => setOpenDept(null)}
        >
          <Image
            src="/brand/logo/djdn-logo.png"
            alt="DJDN"
            width={1080}
            height={478}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        {/* Primary nav, desktop */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-8">
            {NAV.map((item) =>
              item.groups ? (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDept(item.label)}
                  onMouseLeave={() => setOpenDept(null)}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={openDept === item.label}
                    onClick={() =>
                      setOpenDept((v) => (v === item.label ? null : item.label))
                    }
                    className="whitespace-nowrap font-sans text-sm text-ink/80 transition-colors hover:text-primary"
                  >
                    {item.label}
                  </button>

                  {openDept === item.label && (
                    <div className="absolute left-1/2 top-full w-max -translate-x-1/2 pt-4">
                      <div className="min-w-[14rem] rounded-lg border border-outline bg-surface p-6 text-ink shadow-[0_16px_32px_-12px_rgba(28,25,23,0.14)]">
                        <p className="mb-3 font-sans text-sm font-medium text-ink">
                          {item.label}
                        </p>
                        <NavTree
                          item={item}
                          onNavigate={() => setOpenDept(null)}
                        />
                        {item.showAll && item.href && (
                          <Link
                            href={item.href}
                            onClick={() => setOpenDept(null)}
                            className="mt-6 inline-block font-sans text-sm text-ink underline underline-offset-4 transition-colors hover:text-primary"
                          >
                            Shop all {item.label.toLowerCase()}
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="whitespace-nowrap font-sans text-sm text-ink/80 transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        {/* Utility icons */}
        <div className="flex items-center gap-1 lg:flex-1 lg:justify-end">
          <button
            type="button"
            aria-label="Search"
            className="rounded-full p-3 text-ink transition-colors hover:bg-secondary/8"
          >
            <SearchIcon />
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className="rounded-full p-3 text-ink transition-colors hover:bg-secondary/8"
          >
            <AccountIcon />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-full p-3 text-ink transition-colors hover:bg-secondary/8"
          >
            <BagIcon />
          </Link>
        </div>
      </div>

      {/* Mobile nav, full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-20 overflow-y-auto bg-background lg:hidden">
          <nav aria-label="Primary" className="px-4 py-6 sm:px-6">
            <ul className="divide-y divide-outline">
              {NAV.map((item) =>
                item.groups ? (
                  <MobileBranch
                    key={item.label}
                    item={item}
                    onNavigate={() => setMobileOpen(false)}
                  />
                ) : (
                  <li key={item.label} className="py-2">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 font-sans text-base text-ink transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileBranch({
  item,
  onNavigate,
}: {
  item: NavBranch;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="py-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded py-3 font-sans text-base text-ink transition-colors hover:text-primary"
      >
        {item.label}
        <span className={`transition-transform ${open ? "rotate-45" : ""}`}>
          <PlusIcon />
        </span>
      </button>
      {open && (
        <div className="pb-4 pl-1">
          <NavTree item={item} onNavigate={onNavigate} />
          {item.showAll && item.href && (
            <Link
              href={item.href}
              onClick={onNavigate}
              className="mt-6 inline-block font-sans text-sm text-ink underline underline-offset-4 transition-colors hover:text-primary"
            >
              Shop all {item.label.toLowerCase()}
            </Link>
          )}
        </div>
      )}
    </li>
  );
}

/* ---- Icons: hand-rolled, no icon-library dependency ---- */

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 20c1.6-3.6 4.6-5.5 7.5-5.5s5.9 1.9 7.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 8V6.5a5 5 0 0 1 10 0V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 8h13l.9 12a1.5 1.5 0 0 1-1.5 1.6H6.1A1.5 1.5 0 0 1 4.6 20L5.5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
