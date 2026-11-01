import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Google sign-in and email links land. Swaps the one-time `code` for a
 * session cookie, then sends the customer on to `next` (a path on this site).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const requested = searchParams.get("next") ?? "/account";
  // Only follow same-site paths, never an absolute URL or "//host".
  const next =
    requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/account";

  if (isSupabaseConfigured && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/account?error=sign-in`);
}
