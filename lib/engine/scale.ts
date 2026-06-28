// Auto-scaling math. See implementation.md §5.2.
import type { Dimensions } from "@/lib/schema/object";
import { SCENE_EXTENT } from "./constants";

/** Largest single dimension across all objects, in mm. */
export function computeDmax(dims: Dimensions[]): number {
  let dmax = 0;
  for (const d of dims) dmax = Math.max(dmax, d.width, d.height, d.depth);
  return dmax;
}

/** World units per mm. Map the largest single dimension to SCENE_EXTENT. */
export function computeScaleFactor(dims: Dimensions[]): number {
  const dmax = computeDmax(dims);
  if (dmax <= 0) return 0;
  return SCENE_EXTENT / dmax; // world units per mm
}
