// Shared SavedModel schema — kept OUT of the "use client" save module so both the
// browser (lib/models/save.ts) and the server route (app/api/models/route.ts) can
// import the real Zod object. Importing a value from a "use client" module on the
// server yields a client-reference proxy (no .safeParse), which 500s the route.
import { z } from "zod";
import { DimensionsSchema, ShapeSourceSchema } from "@/lib/schema/object";

export const SavedModelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  source: z.enum(["lathe", "csg"]),
  shapeDef: ShapeSourceSchema,
  dimensions: DimensionsSchema,
  visibility: z.enum(["private", "public"]).default("private"),
  createdAt: z.string(),
});
export type SavedModel = z.infer<typeof SavedModelSchema>;
