// Build dispatch — turns any shape source into raw geometry (~mm-space).
// See implementation.md §6.1. Catalog (GLB) is async and handled by the catalog
// pipeline (lib/geometry/catalog.ts); the other three are synchronous.
import * as THREE from "three";
import type { ShapeSource } from "@/lib/schema/object";
import { buildPrimitive } from "./primitive";
import { buildLathe } from "./lathe";
import { buildCsg } from "./csg";

export async function buildGeometry(
  shape: ShapeSource,
): Promise<THREE.BufferGeometry> {
  if (shape.source === "catalog") {
    throw new Error("Catalog geometry loads via lib/geometry/catalog.ts");
  }
  return buildGeometrySync(shape);
}

/** Synchronous build for every source except `catalog`. */
export function buildGeometrySync(shape: ShapeSource): THREE.BufferGeometry {
  switch (shape.source) {
    case "primitive":
      return buildPrimitive(shape.shape);
    case "lathe":
      return buildLathe(shape);
    case "csg":
      return buildCsg(shape);
    case "catalog":
      throw new Error("Synchronous build unsupported for catalog source");
  }
}
