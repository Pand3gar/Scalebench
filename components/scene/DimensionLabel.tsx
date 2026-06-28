"use client";

// CAD-style callout badge anchored above an object.
// Billboard: <Billboard> ensures the group always faces the camera (orientation).
// Screen-space / constant screen-size: <Html> without distanceFactor renders at a
// fixed pixel size regardless of zoom distance (scale). See §5.5.
import { Html, Billboard } from "@react-three/drei";
import type { SceneObject } from "@/lib/schema/object";
import { dimensionLabel } from "@/lib/scene/labels";
import { useSceneStore } from "@/lib/store/useSceneStore";

interface Props {
  object: SceneObject;
  worldHeight: number; // height of object in world units
}

export function DimensionLabel({ object, worldHeight }: Props) {
  const displayUnit = useSceneStore((s) => s.displayUnit);

  return (
    <Billboard position={[0, worldHeight + worldHeight * 0.08 + 0.2, 0]}>
      <Html center occlude={false} zIndexRange={[10, 0]}>
        <div className="pointer-events-none flex flex-col items-center">
          {/* Bubble */}
          <div className="whitespace-nowrap rounded-xl bg-white px-3 py-2 shadow-lg">
            <div className="text-[12px] font-semibold text-foreground">
              {object.label}
            </div>
            <div className="text-[11px] font-medium tabular-nums" style={{ color: "#E8623C" }}>
              {dimensionLabel(object, displayUnit)}
            </div>
          </div>
          {/* Downward pointer triangle */}
          <div
            className="h-0 w-0"
            style={{
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              borderTop: "7px solid white",
            }}
          />
        </div>
      </Html>
    </Billboard>
  );
}
