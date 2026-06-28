// Scene serialization schema (share/save). See implementation.md §4.5.
import { z } from "zod";
import { SceneObjectSchema, Vec3Schema } from "./object";

export const CameraSnapshotSchema = z.object({
  position: Vec3Schema,
  target: Vec3Schema,
  zoom: z.number().positive().default(1),
});
export type CameraSnapshot = z.infer<typeof CameraSnapshotSchema>;

export const SceneSchema = z.object({
  version: z.literal(1),
  displayUnit: z.enum(["mm", "cm", "m", "in", "ft"]),
  objects: z.array(SceneObjectSchema),
  camera: CameraSnapshotSchema.optional(),
  showLabels: z.boolean().default(true),
});
export type Scene = z.infer<typeof SceneSchema>;
