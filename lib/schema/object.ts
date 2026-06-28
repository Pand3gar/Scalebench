// The unified object schema — the spine of ScaleBench.
// Defined with Zod; all TypeScript types are inferred from it so the runtime
// guarantee (mandatory, strictly-positive dimensions) and the static types never
// drift. See implementation.md §4.

import { z } from "zod";

const positive = z.number().finite().positive();

// ---- Dimensions (universal, required, mm) ----
// Real-world axis-aligned bounding box in mm. The ONLY thing the scaling engine reads.
export const DimensionsSchema = z.object({
  width: positive, // X extent, mm
  height: positive, // Y extent, mm
  depth: positive, // Z extent, mm
});
export type Dimensions = z.infer<typeof DimensionsSchema>;

export const Vec3Schema = z.tuple([z.number(), z.number(), z.number()]);
export type Vec3 = z.infer<typeof Vec3Schema>;

// ---- 1. Parametric primitive ----
export const PrimitiveShapeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("box"),
    width: positive,
    height: positive,
    depth: positive,
  }),
  z.object({ kind: z.literal("sphere"), diameter: positive }),
  z.object({ kind: z.literal("cylinder"), diameter: positive, height: positive }),
  z.object({ kind: z.literal("cone"), diameter: positive, height: positive }),
]);
export type PrimitiveShape = z.infer<typeof PrimitiveShapeSchema>;
export type PrimitiveKind = PrimitiveShape["kind"];

export const PrimitiveSourceSchema = z.object({
  source: z.literal("primitive"),
  shape: PrimitiveShapeSchema,
});

// ---- 2. Catalog GLB reference (Phase 1) ----
export const CatalogSourceSchema = z.object({
  source: z.literal("catalog"),
  modelId: z.string().uuid(),
  // GLB optional: when absent the catalog item renders as a calibrated primitive.
  glbUrl: z.string().url().optional(),
  shape: z.enum(["box", "cylinder", "sphere", "cone"]).optional(),
  contentHash: z.string().optional(),
});

// ---- 3. Lathe (surface of revolution) (Phase 2) ----
export const ProfilePointSchema = z.object({
  x: z.number().min(0), // radius (>= 0), mm
  y: z.number(), // height, mm
});

export type ProfilePoint = z.infer<typeof ProfilePointSchema>;

export const LatheSourceSchema = z.object({
  source: z.literal("lathe"),
  template: z.string(),
  profile: z.array(ProfilePointSchema).min(2),
  segments: z.number().int().min(8).max(512).default(96),
  interpolation: z.enum(["catmull-rom", "bezier"]).default("catmull-rom"),
  anchors: z.object({
    totalHeight: positive,
    bodyDiameter: positive,
    mouthDiameter: positive.optional(),
    baseDiameter: positive.optional(),
  }),
});
export type LatheSource = z.infer<typeof LatheSourceSchema>;

// ---- 4. CSG assembly (Phase 2) ----
export const CsgPrimitiveSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("box"),
    width: positive,
    height: positive,
    depth: positive,
  }),
  z.object({ kind: z.literal("sphere"), diameter: positive }),
  z.object({ kind: z.literal("cylinder"), diameter: positive, height: positive }),
  z.object({ kind: z.literal("cone"), diameter: positive, height: positive }),
]);

export type CsgPrimitive = z.infer<typeof CsgPrimitiveSchema>;

export const CsgNodeSchema = z.object({
  id: z.string(),
  primitive: CsgPrimitiveSchema,
  position: Vec3Schema.default([0, 0, 0]),
  rotation: Vec3Schema.default([0, 0, 0]),
  op: z.enum(["ADDITION", "SUBTRACTION", "INTERSECTION", "DIFFERENCE"]),
});
export type CsgNode = z.infer<typeof CsgNodeSchema>;

export const CsgSourceSchema = z.object({
  source: z.literal("csg"),
  nodes: z.array(CsgNodeSchema).min(1),
});
export type CsgSource = z.infer<typeof CsgSourceSchema>;

// ---- Discriminated union on `source` ----
export const ShapeSourceSchema = z.discriminatedUnion("source", [
  PrimitiveSourceSchema,
  CatalogSourceSchema,
  LatheSourceSchema,
  CsgSourceSchema,
]);
export type ShapeSource = z.infer<typeof ShapeSourceSchema>;

// ---- The SceneObject (what lives in the store) ----
export const SceneObjectSchema = z.object({
  id: z.string(), // per-scene instance id
  label: z.string().min(1),
  dimensions: DimensionsSchema, // MANDATORY, strictly positive, mm
  shape: ShapeSourceSchema, // used ONLY to build geometry
  color: z.string().default("#9aa0a6"),
  opacity: z.number().min(0).max(1).default(1),
  visible: z.boolean().default(true),
  meta: z
    .object({
      sourceModelId: z.string().uuid().optional(),
      author: z.string().optional(),
    })
    .default({}),
});
export type SceneObject = z.infer<typeof SceneObjectSchema>;
export type SceneObjectInput = z.input<typeof SceneObjectSchema>;
