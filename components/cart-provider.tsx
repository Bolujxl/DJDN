"use client";

import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CATALOGUE, type Product } from "@/lib/catalogue";
import { formatNaira } from "@/lib/format";

export type CartItem = {
  slug: string;
  colour: string;
  size: string;
  qty: number;
};

export function lineKey(item: Pick<CartItem, "slug" | "colour" | "size">) {
  return `${item.slug}|${item.colour}|${item.size}`;
}

export function findProduct(slug: string): Product | undefined {
  return CATALOGUE.find((p) => p.slug === slug);
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "qty">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "djdn-cart";

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}

/**
 * In-memory cart, mirrored to localStorage so it survives a refresh. There is
 * no backend or checkout yet; this exists so Add to cart has somewhere to put
 * things and the header can show a count. Adding an item opens a small popup
 * confirming what was added.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
    } catch {
      // Storage can be blocked or corrupt; start with an empty cart.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore: the cart still works for this session.
    }
  }, [items, loaded]);

  useEffect(() => {
    if (!lastAdded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLastAdded(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lastAdded]);

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((current) => {
      const key = lineKey(item);
      const existing = current.find((line) => lineKey(line) === key);
      if (existing) {
        return current.map((line) =>
          lineKey(line) === key ? { ...line, qty: line.qty + 1 } : line,
        );
      }
      return [...current, { ...item, qty: 1 }];
    });
    setLastAdded({ ...item, qty: 1 });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((line) => lineKey(line) !== key)
        : current.map((line) => (lineKey(line) === key ? { ...line, qty } : line)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((line) => lineKey(line) !== key));
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((total, line) => total + line.qty, 0),
      add,
      setQty,
      remove,
    }),
    [items, add, setQty, remove],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {lastAdded && (
        <AddedPopup item={lastAdded} onClose={() => setLastAdded(null)} />
      )}
    </CartContext.Provider>
  );
}

function AddedPopup({ item, onClose }: { item: CartItem; onClose: () => void }) {
  const product = findProduct(item.slug);
  if (!product) return null;
  const colourway =
    product.colourways.find((c) => c.name === item.colour) ??
    product.colourways[0];
  const thumb = colourway.look ?? colourway.product;

  return (
    <div
      role="status"
      aria-live="polite"
      className="popup-in fixed right-4 top-24 z-[60] w-[calc(100%-2rem)] max-w-sm border border-outline bg-surface p-5 shadow-[0_16px_32px_-12px_rgba(28,25,23,0.18)] sm:right-6 lg:right-8"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-sans text-sm text-ink">Added to your cart</p>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="-m-2 p-2 text-ink-muted transition-colors hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex gap-4">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-background">
          {thumb && (
            <Image
              src={thumb}
              alt=""
              fill
              sizes="80px"
              className={
                thumb === colourway.product
                  ? "object-contain p-[3%]"
                  : "object-cover"
              }
            />
          )}
        </div>
        <div className="font-sans text-sm">
          <p className="text-ink">{product.name}</p>
          <p className="mt-1 text-ink-muted">
            {item.colour}, size {item.size}
          </p>
          <p className="mt-1 tabular-nums text-ink-muted">
            {formatNaira(product.price)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <Link
          href="/cart"
          onClick={onClose}
          className="flex-1 rounded-[18px] border border-ink px-5 py-3 text-center font-sans text-sm text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-[0.98]"
        >
          View cart
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="font-sans text-sm text-ink underline underline-offset-4 transition-colors hover:text-primary"
        >
          Keep shopping
        </button>
      </div>
    </div>
  );
}
