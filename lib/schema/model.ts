// Catalog model metadata — mirrors the Postgres `models` table, including the
// REQUIRED real-world dimensions (mm). See implementation.md §6, §7.12.
import { z } from "zod";

const positive = z.number().finite().positive();

export const ModelMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  // Real-world dimensions in mm (REQUIRED, strictly positive).
  widthMm: positive,
  heightMm: positive,
  depthMm: positive,
  source: z.enum(["catalog", "lathe", "csg", "primitive"]).default("catalog"),
  // GLB is optional: objects without a 3D asset render as a calibrated primitive
  // (see `shape`) at their true dimensions — still useful for scale comparison.
  glbUrl: z.string().url().optional(),
  shape: z.enum(["box", "cylinder", "sphere", "cone"]).optional(),
  thumbUrl: z.string().url().optional(),
  contentHash: z.string().optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().optional(),
  visibility: z.enum(["private", "public"]).default("public"),
});
export type ModelMetadata = z.infer<typeof ModelMetadataSchema>;

/** Lightweight DTO returned by the catalog search API. */
export const CatalogSearchResultSchema = ModelMetadataSchema.pick({
  id: true,
  name: true,
  slug: true,
  widthMm: true,
  heightMm: true,
  depthMm: true,
  glbUrl: true,
  shape: true,
  thumbUrl: true,
  contentHash: true,
  tags: true,
});
export type CatalogSearchResult = z.infer<typeof CatalogSearchResultSchema>;

/** Convert metadata's mm fields into the unified Dimensions shape. */
export function metadataDimensions(m: {
  widthMm: number;
  heightMm: number;
  depthMm: number;
}) {
  return { width: m.widthMm, height: m.heightMm, depth: m.depthMm };
}
