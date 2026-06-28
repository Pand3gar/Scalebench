// CSG assembly — evaluate a tree of primitive brushes with boolean ops into one
// geometry, via three-bvh-csg. See implementation.md §7.3.
import * as THREE from "three";
import {
  Evaluator,
  Brush,
  ADDITION,
  SUBTRACTION,
  INTERSECTION,
  DIFFERENCE,
} from "three-bvh-csg";
import type { CsgSource, CsgNode } from "@/lib/schema/object";
import { buildPrimitive } from "./primitive";

const OP_MAP = {
  ADDITION,
  SUBTRACTION,
  INTERSECTION,
  DIFFERENCE,
} as const;

function nodeBrush(node: CsgNode): Brush {
  const geo = buildPrimitive(node.primitive);
  const brush = new Brush(geo);
  brush.position.set(node.position[0], node.position[1], node.position[2]);
  brush.rotation.set(node.rotation[0], node.rotation[1], node.rotation[2]);
  brush.updateMatrixWorld(true);
  return brush;
}

/** Evaluate the node tree (applied in order against an accumulator) into one geometry. */
export function buildCsg(src: CsgSource): THREE.BufferGeometry {
  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  let acc: Brush | null = null;
  for (const node of src.nodes) {
    const brush = nodeBrush(node);
    if (!acc) {
      acc = brush; // first node initializes the accumulator
      continue;
    }
    acc = evaluator.evaluate(acc, brush, OP_MAP[node.op]);
  }
  if (!acc) return new THREE.BufferGeometry();
  return acc.geometry;
}

/** Evaluate and return the real-world bounding-box dimensions (mm). */
export function csgDimensions(src: CsgSource) {
  const geo = buildCsg(src);
  geo.computeBoundingBox();
  const size = new THREE.Vector3();
  geo.boundingBox!.getSize(size);
  geo.dispose();
  return {
    width: Math.max(size.x, 1e-3),
    height: Math.max(size.y, 1e-3),
    depth: Math.max(size.z, 1e-3),
  };
}
