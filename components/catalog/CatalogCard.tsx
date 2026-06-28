"use client";

// A single catalog model card. The full GLB is fetched only on "Add" (lazy
// loading); the grid shows a lightweight thumbnail/placeholder. See §7.6.
import { Plus, Box as BoxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { formatMm } from "@/lib/engine/units";
import type { CatalogSearchResult } from "@/lib/schema/model";

export function CatalogCard({
  model,
  onAdd,
}: {
  model: CatalogSearchResult;
  onAdd: (model: CatalogSearchResult) => void;
}) {
  const unit = useSceneStore((s) => s.displayUnit);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card/60">
      <div className="flex h-28 items-center justify-center bg-secondary/40">
        {model.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={model.thumbUrl}
            alt={model.name}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <BoxIcon className="size-8 text-muted-foreground/60" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="font-medium leading-tight">{model.name}</div>
        <div className="text-xs tabular-nums text-muted-foreground">
          {formatMm(model.widthMm, unit)} × {formatMm(model.heightMm, unit)} ×{" "}
          {formatMm(model.depthMm, unit)}
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {model.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <Button
          size="sm"
          className="mt-2"
          onClick={() => onAdd(model)}
        >
          <Plus /> Add to scene
        </Button>
      </div>
    </div>
  );
}
