// Root Zustand store (slice pattern) + derived selectors.
// See implementation.md §7.1.
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { computeScaleFactor } from "@/lib/engine/scale";
import { computeGrid } from "@/lib/engine/grid";
import { SCENE_EXTENT } from "@/lib/engine/constants";
import type { Dimensions } from "@/lib/schema/object";

import { createObjectsSlice } from "./slices/objectsSlice";
import { createSelectionSlice } from "./slices/selectionSlice";
import { createUiSlice } from "./slices/uiSlice";
import { createCameraSlice } from "./slices/cameraSlice";
import type { SceneState } from "./slices/types";

export const useSceneStore = create<SceneState>()(
  subscribeWithSelector((...a) => ({
    builder: null,
    ...createObjectsSlice(...a),
    ...createSelectionSlice(...a),
    ...createUiSlice(...a),
    ...createCameraSlice(...a),
  })),
);

// ---- Derived selectors (computed, never stored, so they cannot go stale) ----

/** Dimensions feeding the scale engine — every object's bounding box. */
function scaleDims(state: SceneState): Dimensions[] {
  return state.objects.map((o) => o.dimensions);
}

export const selectScaleFactor = (state: SceneState): number =>
  computeScaleFactor(scaleDims(state));

export const selectGrid = (state: SceneState) =>
  computeGrid(computeScaleFactor(scaleDims(state)));

export const selectSceneExtent = () => SCENE_EXTENT;

// ---- Convenience hooks ----

export function useScaleFactor() {
  return useSceneStore(selectScaleFactor);
}

export function useGrid() {
  return useSceneStore(useShallow(selectGrid));
}
