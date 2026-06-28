// Universal calibration. See implementation.md §6.3.
import * as THREE from "three";
import type { Dimensions } from "@/lib/schema/object";
import { CALIBRATION_EPSILON } from "@/lib/engine/constants";

/**
 * Scale geometry IN PLACE so its true extents equal `declared` (mm) within epsilon,
 * and recenter it on the origin. The mesh's true extents become the authoritative
 * declared dimensions — accuracy over beauty.
 *
 * - "per-axis": exact match (default) — primitive / lathe / csg.
 * - "uniform": preserve aspect ratio — catalog GLBs (declared still authoritative).
 */
export function calibrate(
  geo: THREE.BufferGeometry,
  declared: Dimensions,
  mode: "per-axis" | "uniform" = "per-axis",
): THREE.BufferGeometry {
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const size = new THREE.Vector3();
  bb.getSize(size);

  // Recenter to origin so the group node controls placement.
  const center = new THREE.Vector3();
  bb.getCenter(center);
  geo.translate(-center.x, -center.y, -center.z);

  const sx = declared.width / (size.x || 1);
  const sy = declared.height / (size.y || 1);
  const sz = declared.depth / (size.z || 1);

  if (mode === "uniform") {
    const s = Math.min(sx, sy, sz);
    geo.scale(s, s, s);
  } else {
    geo.scale(sx, sy, sz);
  }

  // Base-align: drop the geometry so its bottom rests on y = 0 (x/z stay centered).
  geo.computeBoundingBox();
  geo.translate(0, -geo.boundingBox!.min.y, 0);

  // Verify.
  geo.computeBoundingBox();
  const after = new THREE.Vector3();
  geo.boundingBox!.getSize(after);
  const ok =
    Math.abs(after.x - declared.width) < CALIBRATION_EPSILON &&
    Math.abs(after.y - declared.height) < CALIBRATION_EPSILON &&
    Math.abs(after.z - declared.depth) < CALIBRATION_EPSILON;
  if (!ok && mode === "per-axis") {
    // Should never happen for per-axis; surfaces a build error loudly in dev.
    console.warn(
      "[calibrate] per-axis calibration mismatch",
      { declared, after: after.toArray() },
    );
  }
  geo.computeVertexNormals();
  return geo;
}
