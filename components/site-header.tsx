"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Primary nav data. Placeholder categories matching the shape of Sanity's
 * `category` schema (title + department) — swap for a live query once the
 * Studio has real categories. Structure/IA is modelled on Ashluxury's nav:
 * a couple of department links, each opening a mega-menu of grouped
 * subcategories. Everything else (About, Journal, Contact…) lives in the
 * footer, not here — that's what keeps this "uncluttered".
 *
 * Colour: cream-dominant, not a green fill — green only survives as the
 * logo text and a single thin bottom border, per the 60/30/10 balance
 * (neutral dominates; green and orange are moves, not backdrops).
 */
type NavGroup = { title: string; links: { label: string; href: string }[] };
type NavDepartment = {
  label: string;
  href: string;
  groups: NavGroup[];
};

const WHATS_NEW = { label: "What's New", href: "/new-arrivals" };

const NAV: NavDepartment[] = [
  {
    label: "Men",
    href: "/shop/men",
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
];

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
      className="sticky top-0 z-50 border-b border-secondary/20 bg-background/75 text-ink backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="-ml-2 rounded-full p-2 transition-colors hover:bg-secondary/8 lg:hidden"
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

        {/* Primary nav — desktop */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            <li>
              <Link
                href={WHATS_NEW.href}
                className="font-sans text-sm font-medium uppercase tracking-[0.12em] text-ink/80 transition-colors hover:text-primary"
              >
                {WHATS_NEW.label}
              </Link>
            </li>
            {NAV.map((dept) => (
              <li
                key={dept.label}
                className="relative"
                onMouseEnter={() => setOpenDept(dept.label)}
                onMouseLeave={() => setOpenDept(null)}
              >
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openDept === dept.label}
                  onClick={() =>
                    setOpenDept((v) => (v === dept.label ? null : dept.label))
                  }
                  className="font-sans text-sm font-medium uppercase tracking-[0.12em] text-ink/80 transition-colors hover:text-primary"
                >
                  {dept.label}
                </button>

                {openDept === dept.label && (
                  <div className="absolute left-1/2 top-full w-[28rem] -translate-x-1/2 pt-4">
                    <div className="rounded-lg border border-secondary/15 bg-surface p-8 text-ink shadow-[0_16px_32px_-12px_rgba(28,25,23,0.14)]">
                      <div className="grid grid-cols-2 gap-8">
                        {dept.groups.map((group) => (
                          <div key={group.title}>
                            <p className="font-sans text-xs uppercase tracking-[0.15em] text-ink-muted">
                              {group.title}
                            </p>
                            <ul className="mt-3 space-y-2.5">
                              {group.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    onClick={() => setOpenDept(null)}
                                    className="font-sans text-sm text-ink transition-colors hover:text-primary"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <Link
                        href={dept.href}
                        onClick={() => setOpenDept(null)}
                        className="mt-8 inline-block font-sans text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                      >
                        Shop all {dept.label} →
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Utility icons */}
        <div className="flex items-center gap-1 lg:flex-1 lg:justify-end">
          <button
            type="button"
            aria-label="Search"
            className="rounded-full p-2 text-ink transition-colors hover:bg-secondary/8"
          >
            <SearchIcon />
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className="rounded-full p-2 text-ink transition-colors hover:bg-secondary/8"
          >
            <AccountIcon />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-full p-2 text-ink transition-colors hover:bg-secondary/8"
          >
            <BagIcon />
          </Link>
        </div>
      </div>

      {/* Mobile nav — full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-20 overflow-y-auto bg-background lg:hidden">
          <nav aria-label="Primary" className="px-4 py-6 sm:px-6">
            <ul className="divide-y divide-secondary/12">
              <li className="py-2">
                <Link
                  href={WHATS_NEW.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 font-sans text-base font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:text-primary"
                >
                  {WHATS_NEW.label}
                </Link>
              </li>
              {NAV.map((dept) => (
                <MobileDept
                  key={dept.label}
                  dept={dept}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileDept({
  dept,
  onNavigate,
}: {
  dept: NavDepartment;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="py-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded py-3 font-sans text-base font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:text-primary"
      >
        {dept.label}
        <span className={`transition-transform ${open ? "rotate-45" : ""}`}>
          <PlusIcon />
        </span>
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-6 pb-4">
          {dept.groups.map((group) => (
            <div key={group.title}>
              <p className="font-sans text-xs uppercase tracking-[0.15em] text-ink-muted">
                {group.title}
              </p>
              <ul className="mt-3 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className="font-sans text-sm text-ink/85 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Link
            href={dept.href}
            onClick={onNavigate}
            className="col-span-2 font-sans text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Shop all {dept.label} →
          </Link>
        </div>
      )}
    </li>
  );
}

/* ---- Icons — hand-rolled, no icon-library dependency ---- */

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
