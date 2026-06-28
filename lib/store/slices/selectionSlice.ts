import type { SceneSliceCreator, SelectionSlice } from "./types";

export const createSelectionSlice: SceneSliceCreator<SelectionSlice> = (set) => ({
  selectedId: null,
  select: (id) => set({ selectedId: id }),
});
