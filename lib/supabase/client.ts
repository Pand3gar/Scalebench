// Browser Supabase client (Phase 1 + Auth). Returns null when env is not
// configured so the app can run against the local seed catalog in dev. See §7.12.
//
// Uses @supabase/ssr's createBrowserClient so the auth session is stored in
// cookies (not localStorage). This is what lets the session ride along with the
// same-origin fetch to /api/models, where the cookie-aware server client reads it
// via getUser(). A vanilla supabase-js client would keep the session in
// localStorage, which is never sent with fetch — so DB saves would always 401.
import { createBrowserClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) browserClient = createBrowserClient(url!, anonKey!);
  return browserClient;
}
