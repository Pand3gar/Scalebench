"use client";

// The single search/intent entry point. A catalog hit adds the Mode A model; a
// miss offers "build it yourself?" (Mode B, Phase 2). See implementation.md §2.5, §7.4.
import * as React from "react";
import Link from "next/link";
import { Search, Plus, Hammer, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCatalogSearch } from "@/lib/catalog/useCatalogSearch";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { createCatalogObject } from "@/lib/objects/factory";
import { builderHref, templateForIntent } from "@/lib/builders/intent";
import { formatMm } from "@/lib/engine/units";
import type { CatalogSearchResult } from "@/lib/schema/model";

export function EntrySearch() {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const { results, loading, empty } = useCatalogSearch(open ? query : "");
  const addObject = useSceneStore((s) => s.addObject);
  const unit = useSceneStore((s) => s.displayUnit);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const add = (model: CatalogSearchResult) => {
    addObject(createCatalogObject(model));
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-72 max-w-[60vw]">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search objects to add…"
        className="border-0 bg-transparent pl-8"
        role="combobox"
        aria-expanded={open}
        aria-controls="entry-search-results"
      />

      {open && query.trim() ? (
        <div
          id="entry-search-results"
          role="listbox"
          className="absolute z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-border bg-card p-1 shadow-2xl"
        >
          {loading ? (
            <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Searching…
            </div>
          ) : null}

          {!loading &&
            results.map((m) => (
              <button
                key={m.id}
                role="option"
                aria-selected={false}
                onClick={() => add(m)}
                className="flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-left text-sm hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
              >
                <span className="flex items-center gap-2">
                  <Plus className="size-3.5 text-primary" />
                  {m.name}
                </span>
                <span className="tabular-nums text-xs text-muted-foreground">
                  {formatMm(m.heightMm, unit)} tall
                </span>
              </button>
            ))}

          {!loading && empty ? (
            <div className="px-2 py-3 text-sm">
              <p className="text-muted-foreground">
                No catalog match for “{query.trim()}”.
              </p>
              <Link
                href={builderHref(query)}
                onClick={() => setOpen(false)}
                className="mt-2 flex w-full items-center gap-2 rounded border border-dashed border-primary/50 px-2 py-2 text-left text-foreground hover:bg-secondary"
              >
                <Hammer className="size-3.5 text-primary" />
                Build “{query.trim()}” yourself
                <span className="ml-auto text-xs text-muted-foreground">
                  {templateForIntent(query).mode === "lathe" ? "Lathe" : "CSG"}
                </span>
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
