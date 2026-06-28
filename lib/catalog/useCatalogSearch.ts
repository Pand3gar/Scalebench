"use client";

// Debounced catalog search against /api/catalog/search.
import * as React from "react";
import type { CatalogSearchResult } from "@/lib/schema/model";

interface State {
  results: CatalogSearchResult[];
  loading: boolean;
  error: string | null;
  /** True after a completed search that returned no results. */
  empty: boolean;
}

export function useCatalogSearch(query: string, debounceMs = 250): State {
  const [state, setState] = React.useState<State>({
    results: [],
    loading: false,
    error: null,
    empty: false,
  });

  React.useEffect(() => {
    const controller = new AbortController();
    const q = query.trim();
    setState((s) => ({ ...s, loading: true, error: null }));

    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/catalog/search?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data = (await res.json()) as { results: CatalogSearchResult[] };
        setState({
          results: data.results,
          loading: false,
          error: null,
          empty: q.length > 0 && data.results.length === 0,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState({
          results: [],
          loading: false,
          error: (err as Error).message,
          empty: false,
        });
      }
    }, debounceMs);

    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [query, debounceMs]);

  return state;
}
