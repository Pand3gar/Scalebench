"use client";

// Renders one SceneObject. Geometry sources (primitive/lathe/csg) build + calibrate
// a BufferGeometry; the catalog source lazy-loads a GLB. Layout, label, and scale
// depend ONLY on `dimensions`, which every source carries. See §2.4, §6.
import * as React from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { SceneObject } from "@/lib/schema/object";
import { buildGeometrySync } from "@/lib/geometry/build";
import { calibrate } from "@/lib/geometry/calibrate";
import { useSceneStore } from "@/lib/store/useSceneStore";
import { DimensionLabel } from "./DimensionLabel";
import { CatalogContent } from "./CatalogContent";

interface Props {
  object: SceneObject;
  layoutX: number;
  scaleFactor: number;
}

/** Geometry-backed content (primitive / lathe / csg): build, calibrate, render. */
function GeometryContent({
  object,
  onSelect,
}: {
  object: SceneObject;
  onSelect: () => void;
}) {
  const geometry = React.useMemo(() => {
    const raw = buildGeometrySync(object.shape);
    return calibrate(raw, object.dimensions, "per-axis");
  }, [object.shape, object.dimensions]);

  React.useEffect(() => () => geometry.dispose(), [geometry]);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <>
      <mesh geometry={geometry} onClick={onClick} castShadow receiveShadow>
        <meshStandardMaterial
          color={object.color}
          metalness={0.1}
          roughness={0.55}
          transparent={object.opacity < 1}
          opacity={object.opacity}
        />
      </mesh>
    </>
  );
}

export function SceneObjectMesh({ object, layoutX, scaleFactor }: Props) {
  const select = useSceneStore((s) => s.select);
  const showLabels = useSceneStore((s) => s.showLabels);

  if (!object.visible) return null;

  const worldHeight = object.dimensions.height * scaleFactor;
  const onSelect = () => select(object.id);

  return (
    // Outer group: unscaled, positioned in world space (objects are base-aligned).
    <group position={[layoutX, 0, 0]}>
      {/* Scaled group: content is mm-space, base on y = 0; scale to world. */}
      <group scale={[scaleFactor, scaleFactor, scaleFactor]}>
        {object.shape.source === "catalog" ? (
          <CatalogContent
            modelId={object.shape.modelId}
            url={object.shape.glbUrl}
            hash={object.shape.contentHash}
            primitiveShape={object.shape.shape}
            dimensions={object.dimensions}
            color={object.color}
            opacity={object.opacity}
            onSelect={onSelect}
          />
        ) : (
          <GeometryContent object={object} onSelect={onSelect} />
        )}
      </group>

      {showLabels ? (
        <DimensionLabel object={object} worldHeight={worldHeight} />
      ) : null}
    </group>
  );
}
