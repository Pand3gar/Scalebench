"use client";

// UI hint when an object is below the visibility threshold relative to Dmax.
// Open-question default: linear shared scale + a hint (no log fallback). See §12.2.
import { useSceneStore } from "@/lib/store/useSceneStore";
import { computeDmax } from "@/lib/engine/scale";
import { MIN_VISIBLE_RATIO } from "@/lib/engine/constants";

export function TinyObjectHint() {
  const objects = useSceneStore((s) => s.objects);
  if (objects.length < 2) return null;

  const dims = objects.map((o) => o.dimensions);
  const dmax = computeDmax(dims);
  if (dmax <= 0) return null;

  const tiny = objects.filter(
    (o) =>
      Math.max(o.dimensions.width, o.dimensions.height, o.dimensions.depth) <
      MIN_VISIBLE_RATIO * dmax,
  );
  if (tiny.length === 0) return null;

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 max-w-xs rounded-md border border-amber-500 bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow-lg">
      {tiny.length === 1 ? (
        <>
          <span className="font-semibold">{tiny[0].label}</span> is very small
          relative to the largest object and may be hard to see.
        </>
      ) : (
        <>
          {tiny.length} objects are very small relative to the largest object and
          may be hard to see.
        </>
      )}
    </div>
  );
}
