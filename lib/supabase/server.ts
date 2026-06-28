// Server-side Supabase client for route handlers (Phase 1+Auth). Uses @supabase/ssr
// so auth.getUser() works via the session cookie. See §7.12.
// Note: cookies() is async in Next.js 15; we expose an async factory to match.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(url!, anonKey!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      // Route handlers are read-only; middleware (if added later) handles refresh.
      setAll: () => {},
    },
  });
}
