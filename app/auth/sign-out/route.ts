import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * POST only, so a stray link or prefetch can't sign someone out, and only
 * from our own pages: a form on another site can't force a sign-out because
 * browsers send its Origin and we refuse anything that isn't ours.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return new NextResponse(null, { status: 403 });
  }

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/account", request.url), 303);
}
