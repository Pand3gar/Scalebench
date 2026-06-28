// Row layout — auto-arrange objects left-to-right, base-aligned, centred on origin.
// See implementation.md §5.3.
import type { Dimensions } from "@/lib/schema/object";
import { GAP_WORLD } from "./constants";

export interface ObjectLayout {
  /** World-space center X of the object's footprint. */
  x: number;
  /** World width of the object (dimensions.width * scaleFactor). */
  worldWidth: number;
}

/**
 * Compute world-space X centers for a row of objects. Each object's bounding-box
 * bottom sits on y = 0 (handled by the mesh group); here we only solve X so the
 * whole row is centred about x = 0.
 */
export function computeRowLayout(
  dims: Dimensions[],
  scaleFactor: number,
): ObjectLayout[] {
  const widths = dims.map((d) => d.width * scaleFactor);
  const totalWidth =
    widths.reduce((sum, w) => sum + w, 0) +
    GAP_WORLD * Math.max(0, widths.length - 1);

  let cursor = -totalWidth / 2;
  return widths.map((w) => {
    const x = cursor + w / 2;
    cursor += w + GAP_WORLD;
    return { x, worldWidth: w };
  });
}
