// Lathe geometry — revolve a 2D profile (x = radius, y = height) about the Y axis.
// See implementation.md §7.2.
import * as THREE from "three";
import type { LatheSource } from "@/lib/schema/object";

const EPS = 1e-4;

export function buildLathe(src: LatheSource): THREE.BufferGeometry {
  // Sort bottom -> top and clamp radius >= 0.
  const sorted = [...src.profile]
    .map((p) => ({ x: Math.max(0, p.x), y: p.y }))
    .sort((a, b) => a.y - b.y);

  // Close the base: if the lowest point is off-axis, add an axis point so the
  // bottom reads as a solid disc (mouth left open).
  const points = sorted.slice();
  if (points[0].x > EPS) points.unshift({ x: 0, y: points[0].y });

  // Smooth interpolation into a dense polyline. (catmull-rom / bezier both use a
  // Catmull–Rom spline through the control points; see Assumptions.)
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p.x, p.y, 0)),
    false,
    "catmullrom",
    0.5,
  );
  const dense = curve
    .getPoints(Math.max(64, points.length * 16))
    .map((v) => new THREE.Vector2(Math.max(0, v.x), v.y));

  return new THREE.LatheGeometry(dense, src.segments);
}
