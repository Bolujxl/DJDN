/**
 * Accounts and orders run on Supabase. Until its keys are in `.env.local` the
 * site still builds and runs; anything that needs it checks this first and
 * falls back to its "coming soon" state.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase now calls this the "publishable key" (its Connect panel suggests
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY); older projects call it the "anon key".
// Either name works. It is safe in the browser. The secret key never goes here.
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
