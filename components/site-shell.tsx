import { CartProvider } from "./cart-provider";
import { CountryProvider } from "./country-provider";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * Header, main and footer around a page. Shared by the storefront layout and
 * the root 404, which sits outside the (site) group and so needs its own copy.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <CountryProvider>
    <CartProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-[18px] focus:bg-surface focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
    </CartProvider>
    </CountryProvider>
  );
}
