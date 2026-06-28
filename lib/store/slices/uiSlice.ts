import type { SceneSliceCreator, UiSlice } from "./types";

export const createUiSlice: SceneSliceCreator<UiSlice> = (set) => ({
  displayUnit: "cm",
  setDisplayUnit: (u) => set({ displayUnit: u }),

  showLabels: true,
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
});
