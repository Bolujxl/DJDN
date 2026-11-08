import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { COUNTRY_COOKIE, isCountry } from "@/lib/currency";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/** Routes where a Supabase session matters; everywhere else skips the auth call. */
const SESSION_PATHS = ["/account", "/track-order", "/auth"];

/**
 * Two jobs.
 *
 * 1. On a visitor's first request, remember their country in a cookie so prices
 *    can show in their currency. The country comes from the hosting platform's
 *    location header (Vercel sets `x-vercel-ip-country`; there is none on
 *    localhost, so local development stays on naira). Only countries DJDN ships
 *    to are stored, and a choice the shopper made themselves is never replaced.
 * 2. Keep the Supabase session fresh on the account routes: refresh an expired
 *    token and write the new cookies onto the response. Does nothing until
 *    Supabase is configured.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const detected = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  if (!request.cookies.has(COUNTRY_COOKIE) && isCountry(detected)) {
    response.cookies.set(COUNTRY_COOKIE, detected, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  const { pathname } = request.nextUrl;
  const needsSession = SESSION_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (!needsSession || !isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        // A new response drops what was set above, so carry the country cookie over.
        const country = response.cookies.get(COUNTRY_COOKIE);
        response = NextResponse.next({ request });
        if (country) response.cookies.set(country);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Validates the token with Supabase; this call is what triggers the refresh.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Every page, but not static files or Next internals.
  matcher: ["/((?!_next/|api/|brand/|.*\\..*).*)"],
};
