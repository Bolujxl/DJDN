import { createClient } from "@supabase/supabase-js";

import { SUPABASE_URL } from "./config";

/**
 * Service-role client. It bypasses row level security, so it is server-only
 * (never import this from a client component) and returns null unless the key
 * is set. Use it only for jobs RLS can't express, such as attaching a guest
 * order to the account that later signs in with the same email.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
