"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCart } from "./cart-provider";

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
        links: [
          { label: "Tops", href: "/shop/men/tops" },
          { label: "Pants", href: "/shop/men/pants" },
          { label: "Sweats", href: "/shop/men/sweats" },
          { label: "Head gear", href: "/shop/men/head-gear" },
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
        links: [
          { label: "Tops", href: "/shop/women/tops" },
          { label: "Pants", href: "/shop/women/pants" },
          { label: "Sweats", href: "/shop/women/sweats" },
          { label: "Head gear", href: "/shop/women/head-gear" },
        ],
      },
    ],
  },
  { label: "Blog", href: "/blog" },
];

/**
 * Desktop nav item. The colour eases over 300ms and a hairline underline draws
 * in from the left on hover; the section you're in is full ink with the line
 * already drawn.
 */
const navLinkClass = (active: boolean) =>
  `relative whitespace-nowrap font-sans text-sm transition-colors duration-300 ease-out hover:text-primary after:absolute after:inset-x-0 after:-bottom-2 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:after:transition-none ${
    active
      ? "text-ink after:scale-x-100"
      : "text-ink/80 after:scale-x-0 hover:after:scale-x-100"
  }`;

/** Icon buttons in the header: a soft circle fades in behind the icon. */
const ICON_BUTTON =
  "rounded-full p-3 text-ink transition-colors duration-300 ease-out hover:bg-secondary/8 motion-reduce:transition-none";

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
                  className="block py-1.5 font-sans text-sm text-ink transition-[color,translate] duration-300 ease-out hover:translate-x-0.5 hover:text-primary motion-reduce:transition-none"
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
  const [hidden, setHidden] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();
  const isActive = (href?: string) =>
    Boolean(href) && (pathname === href || pathname.startsWith(`${href}/`));
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover intent for the mega-menu: it opens at once but closes after a short
  // pause, so a cursor that clips the edge on its way to a link doesn't make
  // the menu flicker shut.
  function openMenu(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDept(label);
  }
  function closeMenuSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDept(null), 140);
  }
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Hide on scroll down, show on scroll up. The anchor resets whenever the
  // direction flips, so slow scrolling still triggers (per-event deltas can be
  // 1px) without flickering on tiny back-and-forth movement.
  useEffect(() => {
    let lastY = window.scrollY;
    let anchorY = lastY;
    let direction = 0;
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      const next = delta > 0 ? 1 : delta < 0 ? -1 : direction;
      if (next !== direction) {
        direction = next;
        anchorY = y;
      }
      if (y < 80) setHidden(false);
      else if (direction === 1 && y - anchorY > 24) setHidden(true);
      else if (direction === -1 && anchorY - y > 12) setHidden(false);
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Never tuck the header away while a menu is open.
  const tucked = hidden && !mobileOpen && openDept === null;

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

  // Mobile menu focus: move into it on open, keep Tab cycling between the
  // menu button and the menu links (the page behind is out of reach), and put
  // focus back on the button when it closes.
  useEffect(() => {
    if (!mobileOpen) return;
    const overlay = overlayRef.current;
    const trigger = menuButtonRef.current;
    overlay?.querySelector<HTMLElement>("a[href], button")?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !overlay) return;
      const stops = [
        trigger,
        ...overlay.querySelectorAll<HTMLElement>("a[href], button"),
      ].filter((el): el is HTMLElement => el !== null);
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const active = document.activeElement;
      if (active === document.body || overlay?.contains(active)) {
        trigger?.focus();
      }
    };
  }, [mobileOpen]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
    <header
      ref={headerRef}
      onFocus={() => setHidden(false)}
      className={`sticky top-0 z-50 border-b border-outline bg-background/75 text-ink backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${
        tucked ? "-translate-y-full" : ""
      }`}
    >
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu trigger */}
        <button
          ref={menuButtonRef}
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
          className="transition-opacity duration-300 ease-out hover:opacity-70 motion-reduce:transition-none lg:flex-1"
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
                  onMouseEnter={() => openMenu(item.label)}
                  onMouseLeave={closeMenuSoon}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={openDept === item.label}
                    onClick={() =>
                      setOpenDept((v) => (v === item.label ? null : item.label))
                    }
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={navLinkClass(isActive(item.href))}
                  >
                    {item.label}
                  </button>

                  {openDept === item.label && (
                    <div className="absolute left-1/2 top-full w-max -translate-x-1/2 pt-4">
                      <div className="popup-in min-w-[14rem] rounded-lg border border-outline bg-surface p-6 text-ink shadow-[0_16px_32px_-12px_rgba(28,25,23,0.14)]">
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
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={navLinkClass(isActive(item.href))}
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
          <Link
            href="/search"
            aria-label="Search"
            className={ICON_BUTTON}
          >
            <SearchIcon />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className={ICON_BUTTON}
          >
            <AccountIcon />
          </Link>
          <Link
            href="/cart"
            aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
            className={`relative ${ICON_BUTTON}`}
          >
            <CartIcon />
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 font-sans text-xs leading-none text-surface"
              >
                {count}
              </span>
            )}
            {/* Link names aren't announced when they change; this is. */}
            <span role="status" className="sr-only">
              {count > 0 ? `${count} items in cart` : ""}
            </span>
          </Link>
        </div>
      </div>
    </header>

      {/* Mobile nav, full-screen overlay. Sits outside the header on purpose:
          a transformed ancestor becomes the containing block for `fixed`
          children, which would break this overlay while the header slides. */}
      {mobileOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto bg-background lg:hidden"
        >
          <nav aria-label="Mobile" className="px-4 py-6 sm:px-6">
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

            {/* Help sits in the footer on desktop, several screens down on a
                phone, so the common ones are repeated here. */}
            <p className="mt-8 font-sans text-xs text-ink-muted">Help</p>
            <ul className="mt-2">
              {MOBILE_HELP.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 font-sans text-base text-ink transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

const MOBILE_HELP = [
  { label: "Customer care", href: "/customer-care" },
  { label: "Track order", href: "/track-order" },
  { label: "Returns", href: "/returns" },
];

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

/** A cart, to match the "Cart" wording used everywhere else on the site. */
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.5 4h2.6l2.2 11h10.4l1.9-8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="19.5" r="1.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="19.5" r="1.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
