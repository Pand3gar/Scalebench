// Dimension-callout text. Radial shapes show ⌀ × h; others show W × H × D.
// See implementation.md §5.5.
import type { SceneObject } from "@/lib/schema/object";
import { formatMmValue, formatMm, type UnitId } from "@/lib/engine/units";

export function isRadialObject(obj: SceneObject): boolean {
  if (obj.shape.source === "primitive") return obj.shape.shape.kind !== "box";
  if (obj.shape.source === "lathe") return true;
  return false;
}

/** Callout string for the object in the active display unit. */
export function dimensionLabel(obj: SceneObject, unit: UnitId): string {
  const { width, height, depth } = obj.dimensions;
  if (isRadialObject(obj)) {
    // diameter is width (== depth) for radial shapes.
    return `⌀${formatMmValue(width, unit)} × ${formatMm(height, unit)}`;
  }
  return `${formatMmValue(width, unit)} × ${formatMmValue(height, unit)} × ${formatMm(
    depth,
    unit,
  )}`;
}
