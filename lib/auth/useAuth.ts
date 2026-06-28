"use client";

// Reactive auth hook — tracks the Supabase session in the browser.
// Returns null for user when unauthenticated OR when Supabase is unconfigured
// (dev mode against seed catalog). See implementation.md §7.12.
import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Hydrate from the existing session immediately.
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Keep in sync with sign-in / sign-out events.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, loading };
}
