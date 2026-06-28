// CSG builder defaults. Pure helpers for the editor (geometry eval lives in
// lib/geometry/csg.ts). See implementation.md §7.3.
import { nanoid } from "nanoid";
import type { CsgNode, CsgPrimitive, PrimitiveKind } from "@/lib/schema/object";

export const CSG_OPS = [
  "ADDITION",
  "SUBTRACTION",
  "INTERSECTION",
  "DIFFERENCE",
] as const;
export type CsgOp = (typeof CSG_OPS)[number];

export const CSG_PRIMITIVE_PRESETS: Record<PrimitiveKind, CsgPrimitive> = {
  box: { kind: "box", width: 120, height: 60, depth: 80 },
  sphere: { kind: "sphere", diameter: 80 },
  cylinder: { kind: "cylinder", diameter: 60, height: 120 },
  cone: { kind: "cone", diameter: 80, height: 120 },
};

export function createCsgNode(
  kind: PrimitiveKind = "box",
  op: CsgOp = "ADDITION",
): CsgNode {
  return {
    id: nanoid(6),
    primitive: CSG_PRIMITIVE_PRESETS[kind],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    op,
  };
}

/** A sensible starting assembly (a rounded slab) so users don't begin empty. */
export function defaultCsgNodes(): CsgNode[] {
  return [
    {
      id: nanoid(6),
      primitive: { kind: "box", width: 160, height: 50, depth: 100 },
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      op: "ADDITION",
    },
    {
      id: nanoid(6),
      primitive: { kind: "cylinder", diameter: 40, height: 60 },
      position: [50, 0, 0],
      rotation: [0, 0, 0],
      op: "SUBTRACTION",
    },
  ];
}
