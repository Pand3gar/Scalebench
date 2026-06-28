// Shared store types. See implementation.md §7.1.
import type { StateCreator } from "zustand";
import type { Dimensions, SceneObject } from "@/lib/schema/object";
import type { CameraSnapshot, Scene } from "@/lib/schema/scene";
import type { UnitId } from "@/lib/engine/units";

// Builder slice is fleshed out in Phase 2; typed loosely here so the store shape
// is stable across phases.
export type BuilderState = unknown;

export interface ObjectsSlice {
  objects: SceneObject[];
  addObject: (o: unknown) => void; // validates via SceneObjectSchema.parse
  removeObject: (id: string) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  updateDimensions: (id: string, d: Partial<Dimensions>) => void;
  reorder: (from: number, to: number) => void; // dnd-kit
  clear: () => void;
  loadScene: (scene: Scene) => void;
}

export interface SelectionSlice {
  selectedId: string | null;
  select: (id: string | null) => void;
}

export interface UiSlice {
  displayUnit: UnitId;
  setDisplayUnit: (u: UnitId) => void;
  showLabels: boolean;
  toggleLabels: () => void;
}

export interface CameraSlice {
  camera: CameraSnapshot | null;
  setCamera: (c: CameraSnapshot) => void;
}

export interface BuilderSlice {
  builder: BuilderState | null;
}

export type SceneState = ObjectsSlice &
  SelectionSlice &
  UiSlice &
  CameraSlice &
  BuilderSlice;

export type SceneSliceCreator<T> = StateCreator<
  SceneState,
  [["zustand/subscribeWithSelector", never]],
  [],
  T
>;
