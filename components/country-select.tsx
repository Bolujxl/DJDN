"use client";

import { COUNTRIES, COUNTRY_CODES, isCountry } from "@/lib/currency";

import { useCountry } from "./country-provider";

/**
 * Small "Shipping to" picker for the footer. Changing it changes the currency
 * prices are shown in across the site. Sits on the green footer, so it takes
 * the footer's light-on-dark colours.
 */
export function CountrySelect() {
  const { country, setCountry } = useCountry();

  // Nothing to choose between while we ship to one country.
  if (COUNTRY_CODES.length < 2) return null;

  return (
    <label className="flex items-center gap-3 font-sans text-xs text-on-secondary-muted">
      Shipping to
      <select
        value={country}
        onChange={(e) => {
          if (isCountry(e.target.value)) setCountry(e.target.value);
        }}
        className="rounded-[18px] border border-white/20 bg-transparent px-3 py-2 text-base text-on-secondary transition-colors hover:border-white/40 sm:text-sm"
      >
        {COUNTRY_CODES.map((code) => (
          <option key={code} value={code} className="text-ink">
            {COUNTRIES[code].name} ({COUNTRIES[code].currency})
          </option>
        ))}
      </select>
    </label>
  );
}
