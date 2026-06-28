"use client";

// Global display-unit toggle. Keyboard-operable radiogroup (a11y, §7.10).
import { useSceneStore } from "@/lib/store/useSceneStore";
import { UNIT_IDS, type UnitId } from "@/lib/engine/units";
import { cn } from "@/lib/utils";

export function UnitToggle() {
  const displayUnit = useSceneStore((s) => s.displayUnit);
  const setDisplayUnit = useSceneStore((s) => s.setDisplayUnit);

  return (
    <div
      role="radiogroup"
      aria-label="Display unit"
      className="inline-flex rounded-md bg-secondary/50 p-0.5"
    >
      {UNIT_IDS.map((u: UnitId) => {
        const active = u === displayUnit;
        return (
          <button
            key={u}
            role="radio"
            aria-checked={active}
            onClick={() => setDisplayUnit(u)}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {u}
          </button>
        );
      })}
    </div>
  );
}
