import { SceneObjectSchema } from "@/lib/schema/object";
import { SceneSchema } from "@/lib/schema/scene";
import type { ObjectsSlice, SceneSliceCreator } from "./types";

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export const createObjectsSlice: SceneSliceCreator<ObjectsSlice> = (set) => ({
  objects: [],

  // Enforces the "dimensions are mandatory" rule: parse throws on invalid input,
  // so no object can enter the scene without valid, strictly-positive dimensions.
  addObject: (o) =>
    set((state) => {
      const parsed = SceneObjectSchema.parse(o);
      return {
        objects: [...state.objects, parsed],
        selectedId: parsed.id,
      };
    }),

  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  updateObject: (id, patch) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? SceneObjectSchema.parse({ ...obj, ...patch }) : obj,
      ),
    })),

  updateDimensions: (id, d) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id
          ? SceneObjectSchema.parse({
              ...obj,
              dimensions: { ...obj.dimensions, ...d },
            })
          : obj,
      ),
    })),

  reorder: (from, to) =>
    set((state) => ({ objects: arrayMove(state.objects, from, to) })),

  clear: () => set({ objects: [], selectedId: null }),

  // Hydrate the whole scene (e.g. from a share link). Revalidates via SceneSchema.
  loadScene: (scene) =>
    set(() => {
      const s = SceneSchema.parse(scene);
      return {
        objects: s.objects,
        displayUnit: s.displayUnit,
        showLabels: s.showLabels,
        camera: s.camera ?? null,
        selectedId: null,
      };
    }),
});
