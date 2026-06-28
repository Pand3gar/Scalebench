// Grid "nice-number" math. See implementation.md §5.4.
import { GRID_TARGET_WORLD } from "./constants";

/** Snap to 1/2/5 × 10^k. */
export function niceNumber(value: number): number {
  if (value <= 0) return 0;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const f = value / base; // 1..10
  const nice = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nice * base;
}

export interface GridInfo {
  cellMm: number; // real-world cell size (snapped), mm
  cellWorld: number; // rendered grid spacing, world units
}

export function computeGrid(scaleFactor: number): GridInfo {
  if (scaleFactor <= 0) return { cellMm: 0, cellWorld: 0 };
  const targetMm = GRID_TARGET_WORLD / scaleFactor; // world -> mm
  const cellMm = niceNumber(targetMm); // snap
  return { cellMm, cellWorld: cellMm * scaleFactor }; // mm -> world
}
