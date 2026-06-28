// Factory + presets for creating valid SceneObjects from primitives.
import { nanoid } from "nanoid";
import {
  SceneObjectSchema,
  type PrimitiveKind,
  type PrimitiveShape,
  type SceneObject,
  type SceneObjectInput,
} from "@/lib/schema/object";
import { COMPOSITES } from "@/lib/catalog/composites";
import { primitiveDimensions } from "@/lib/geometry/primitive";
import {
  metadataDimensions,
  type CatalogSearchResult,
} from "@/lib/schema/model";
import type { Dimensions } from "@/lib/schema/object";
import {
  latheDimensions,
  type LatheAnchors,
} from "@/lib/builders/lathe";
import type { ProfilePoint, CsgNode } from "@/lib/schema/object";

const PALETTE = [
  "#38bdf8",
  "#f97316",
  "#a78bfa",
  "#34d399",
  "#f43f5e",
  "#facc15",
  "#22d3ee",
  "#fb7185",
];

let colorCursor = 0;
function nextColor(): string {
  const c = PALETTE[colorCursor % PALETTE.length];
  colorCursor += 1;
  return c;
}

/** Default primitive shapes (mm) used by the Add menu. */
export const PRIMITIVE_PRESETS: Record<PrimitiveKind, PrimitiveShape> = {
  box: { kind: "box", width: 200, height: 300, depth: 150 },
  sphere: { kind: "sphere", diameter: 250 },
  cylinder: { kind: "cylinder", diameter: 120, height: 300 },
  cone: { kind: "cone", diameter: 200, height: 350 },
};

const DEFAULT_LABEL: Record<PrimitiveKind, string> = {
  box: "Box",
  sphere: "Sphere",
  cylinder: "Cylinder",
  cone: "Cone",
};

/** Build a validated SceneObject from a primitive shape. */
export function createPrimitiveObject(
  shape: PrimitiveShape,
  label?: string,
): SceneObject {
  return SceneObjectSchema.parse({
    id: nanoid(8),
    label: label ?? DEFAULT_LABEL[shape.kind],
    dimensions: primitiveDimensions(shape),
    shape: { source: "primitive", shape },
    color: nextColor(),
  });
}

export function createPrimitiveFromKind(kind: PrimitiveKind): SceneObject {
  return createPrimitiveObject(PRIMITIVE_PRESETS[kind]);
}

/** Build a validated lathe SceneObject. Dimensions derive from the anchors. */
export function createLatheObject(
  name: string,
  args: {
    template: string;
    profile: ProfilePoint[];
    anchors: LatheAnchors;
    segments?: number;
    interpolation?: "catmull-rom" | "bezier";
  },
): SceneObject {
  return SceneObjectSchema.parse({
    id: nanoid(8),
    label: name || "Lathe object",
    dimensions: latheDimensions(args.anchors),
    shape: {
      source: "lathe",
      template: args.template,
      profile: args.profile,
      segments: args.segments ?? 96,
      interpolation: args.interpolation ?? "catmull-rom",
      anchors: args.anchors,
    },
    color: nextColor(),
  });
}

/** Build a validated CSG SceneObject. Dimensions are the evaluated bounding box. */
export function createCsgObject(
  name: string,
  nodes: CsgNode[],
  dimensions: Dimensions,
): SceneObject {
  return SceneObjectSchema.parse({
    id: nanoid(8),
    label: name || "CSG object",
    dimensions,
    shape: { source: "csg", nodes },
    color: nextColor(),
  });
}

/** Build a validated catalog SceneObject from a search result.
 *
 * Three flavours, in priority order:
 *  1. A procedural composite is registered for the slug → build it as CSG.
 *  2. The item carries a GLB url → reference it as a catalog source.
 *  3. Neither → a calibrated primitive (model.shape, default box).
 */
export function createCatalogObject(model: CatalogSearchResult): SceneObject {
  const dimensions = metadataDimensions(model);
  const composite = COMPOSITES[model.slug];

  const shape: SceneObjectInput["shape"] = composite
    ? { source: "csg", nodes: composite(dimensions) }
    : {
        source: "catalog",
        modelId: model.id,
        glbUrl: model.glbUrl,
        shape: model.shape,
        contentHash: model.contentHash,
      };

  return SceneObjectSchema.parse({
    id: nanoid(8),
    label: model.name,
    dimensions,
    shape,
    color: nextColor(),
    meta: { sourceModelId: model.id },
  });
}
