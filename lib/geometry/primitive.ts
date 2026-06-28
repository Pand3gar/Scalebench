// Parametric primitive geometry, authored directly in mm.
// See implementation.md §6.2.
import * as THREE from "three";
import type { PrimitiveShape } from "@/lib/schema/object";

export function buildPrimitive(shape: PrimitiveShape): THREE.BufferGeometry {
  switch (shape.kind) {
    case "box":
      return new THREE.BoxGeometry(shape.width, shape.height, shape.depth);
    case "sphere":
      return new THREE.SphereGeometry(shape.diameter / 2, 48, 32);
    case "cylinder":
      return new THREE.CylinderGeometry(
        shape.diameter / 2,
        shape.diameter / 2,
        shape.height,
        64,
      );
    case "cone":
      return new THREE.ConeGeometry(shape.diameter / 2, shape.height, 64);
  }
}

/** Resolve the real-world bounding box (mm) implied by a primitive shape. */
export function primitiveDimensions(shape: PrimitiveShape) {
  switch (shape.kind) {
    case "box":
      return { width: shape.width, height: shape.height, depth: shape.depth };
    case "sphere":
      return {
        width: shape.diameter,
        height: shape.diameter,
        depth: shape.diameter,
      };
    case "cylinder":
    case "cone":
      return {
        width: shape.diameter,
        height: shape.height,
        depth: shape.diameter,
      };
  }
}

/** Radially symmetric shapes display a ⌀ × h callout rather than W × H × D. */
export function isRadialPrimitive(shape: PrimitiveShape): boolean {
  return shape.kind !== "box";
}
