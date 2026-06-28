"use client";

// HUD legend showing the real-world size of one grid cell. DOM overlay (not in
// the Canvas). See implementation.md §5.4.
import { useGrid, useSceneStore } from "@/lib/store/useSceneStore";
import { formatMm } from "@/lib/engine/units";

export function GridLegend() {
  const { cellMm } = useGrid();
  const displayUnit = useSceneStore((s) => s.displayUnit);
  const hasObjects = useSceneStore((s) => s.objects.length > 0);

  if (!hasObjects || cellMm <= 0) return null;

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-md border border-border/70 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur-sm">
      <span className="inline-block h-3 w-3 rounded-sm border border-[#3b4a5e] bg-[#2b3340]/40" />
      <span>
        1 grid square ={" "}
        <span className="font-semibold tabular-nums text-foreground">
          {formatMm(cellMm, displayUnit)}
        </span>
      </span>
    </div>
  );
}
