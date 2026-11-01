import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/**
 * Keeps the Supabase session fresh on the account routes: refreshes an expired
 * token and writes the new cookies onto the response. Only runs where a
 * session matters, so the rest of the storefront is untouched. Does nothing
 * until Supabase is configured.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
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
  matcher: ["/account/:path*", "/track-order/:path*", "/auth/:path*"],
};
