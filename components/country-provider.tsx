"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
  formatPrice,
  isCountry,
  type CountryCode,
} from "@/lib/currency";

/**
 * The shopper's country, which decides the currency prices are shown in and
 * where the checkout ships to. It lives in a cookie: `proxy.ts` sets it from
 * the visitor's location on their first request, and the footer or checkout
 * country picker overwrites it. The server and the first client render both use
 * the default (Nigeria); the real value swaps in straight after hydration, so
 * there is no mismatch.
 */
type CountryValue = {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
  /** Kobo in, a price in the shopper's currency out. */
  format: (kobo: number) => string;
};

const CountryContext = createContext<CountryValue | null>(null);

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readCountry(): CountryCode {
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${COUNTRY_COOKIE}=`));
  const value = match?.slice(COUNTRY_COOKIE.length + 1);
  return isCountry(value) ? value : DEFAULT_COUNTRY;
}

export function useCountry(): CountryValue {
  const value = useContext(CountryContext);
  if (!value) throw new Error("useCountry must be used inside <CountryProvider>");
  return value;
}

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const country = useSyncExternalStore(
    subscribe,
    readCountry,
    () => DEFAULT_COUNTRY,
  );

  const setCountry = useCallback((next: CountryCode) => {
    document.cookie = `${COUNTRY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    listeners.forEach((listener) => listener());
  }, []);

  const value = useMemo<CountryValue>(
    () => ({
      country,
      setCountry,
      format: (kobo) => formatPrice(kobo, country),
    }),
    [country, setCountry],
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

/** A price in the shopper's currency. Use this anywhere a catalogue price shows. */
export function Price({ kobo }: { kobo: number }) {
  const { format } = useCountry();
  return <>{format(kobo)}</>;
}
