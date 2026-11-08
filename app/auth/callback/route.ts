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

  // Resolve `next` against our own origin and keep it only if it still lands
  // here. Browsers treat "\" like "/", so string checks on the first
  // character aren't enough to rule out "/\evil.com".
  let next = "/account";
  try {
    const target = new URL(searchParams.get("next") ?? "/account", origin);
    if (target.origin === origin) next = target.pathname + target.search;
  } catch {
    // Unparseable: keep the default.
  }

  if (isSupabaseConfigured && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/account?error=sign-in`);
}
