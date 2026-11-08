/**
 * Where DJDN ships, and the currency each place sees prices in. Catalogue
 * prices are stored in naira kobo (the one source of truth); everything else is
 * a display conversion from that.
 *
 * PLACEHOLDER RATES: `ngnPerUnit` is how many naira one pound or dollar is
 * worth. These are rough figures to make the screens work, not DJDN's real
 * pricing. Before launch, either set them to the rates the business wants to
 * use, or replace the conversion with a fixed price list per currency. Prices
 * are rounded to whole pounds and dollars.
 *
 * This file has no React in it, so server and client code can both import it.
 */
export type CountryCode = "NG" | "GB" | "US";

type CountryInfo = {
  name: string;
  /** ISO 4217 code, passed to Intl.NumberFormat. */
  currency: "NGN" | "GBP" | "USD";
  /** Spoken name of the currency, for notes like "Prices are shown in ...". */
  currencyName: string;
  locale: string;
  /** Naira per one unit of this currency. 1 for naira itself. */
  ngnPerUnit: number;
};

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  NG: {
    name: "Nigeria",
    currency: "NGN",
    currencyName: "Nigerian naira (₦)",
    locale: "en-NG",
    ngnPerUnit: 1,
  },
  GB: {
    name: "United Kingdom",
    currency: "GBP",
    currencyName: "British pounds (£)",
    locale: "en-GB",
    ngnPerUnit: 2000, // placeholder
  },
  US: {
    name: "United States",
    currency: "USD",
    currencyName: "US dollars ($)",
    locale: "en-US",
    ngnPerUnit: 1500, // placeholder
  },
};

/**
 * The countries DJDN ships to right now. This is the switch: launch is Nigeria
 * only, so everything shows in naira and the country picker, UK/US address
 * fields and currency conversion stay hidden. To open up the UK and/or US, add
 * "GB" and/or "US" here, after settling the rates (above), what cards are
 * charged in, delivery fees and how import duties are handled.
 */
export const COUNTRY_CODES: CountryCode[] = ["NG"];
export const DEFAULT_COUNTRY: CountryCode = "NG";

/** Cookie holding the shopper's country: set from their location, changeable by them. */
export const COUNTRY_COOKIE = "djdn-country";

/** True only for countries we currently ship to, so a stale or edited cookie is ignored. */
export function isCountry(value: unknown): value is CountryCode {
  return (
    typeof value === "string" &&
    (COUNTRY_CODES as string[]).includes(value)
  );
}

/** Kobo in, display string out, in the currency of `country`. */
export function formatPrice(kobo: number, country: CountryCode): string {
  const info = COUNTRIES[country];
  const naira = kobo / 100;
  if (info.currency === "NGN") {
    return `₦${naira.toLocaleString(info.locale, { minimumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat(info.locale, {
    style: "currency",
    currency: info.currency,
    maximumFractionDigits: 0,
  }).format(Math.round(naira / info.ngnPerUnit));
}
