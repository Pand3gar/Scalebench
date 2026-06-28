import type { CameraSlice, SceneSliceCreator } from "./types";

export const createCameraSlice: SceneSliceCreator<CameraSlice> = (set) => ({
  camera: null,
  setCamera: (c) => set({ camera: c }),
});
