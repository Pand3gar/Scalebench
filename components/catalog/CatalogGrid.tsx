"use client";

// Searchable catalog grid. Adds catalog objects to the shared scene. See §7.6.
import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CatalogCard } from "./CatalogCard";
import { useCatalogSearch } from "@/lib/catalog/useCatalogSearch";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { createCatalogObject } from "@/lib/objects/factory";
import type { CatalogSearchResult } from "@/lib/schema/model";

export function CatalogGrid({ onAdded }: { onAdded?: () => void }) {
  const [query, setQuery] = React.useState("");
  const { results, loading, error, empty } = useCatalogSearch(query);
  const addObject = useSceneStore((s) => s.addObject);

  const add = (model: CatalogSearchResult) => {
    addObject(createCatalogObject(model));
    onAdded?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search objects… (e.g. bottle, helmet)"
          className="pl-8"
          aria-label="Search catalog"
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {empty ? (
        <p className="text-sm text-muted-foreground">
          No catalog match for “{query}”. Mode B (build it yourself) arrives in
          Phase 2.
        </p>
      ) : null}

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        aria-busy={loading}
      >
        {results.map((m) => (
          <CatalogCard key={m.id} model={m} onAdd={add} />
        ))}
      </div>
    </div>
  );
}
