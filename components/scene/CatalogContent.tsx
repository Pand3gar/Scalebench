"use client";

// Renders a catalog object in mm-space. Two flavours:
//  • GLB-backed: shows a calibrated wireframe placeholder (correct scale immediately)
//    while the model lazy-loads, then swaps in the real mesh.
//  • Primitive-backed (no GLB): renders a solid calibrated box/cylinder/sphere/cone
//    at the item's true dimensions — still a faithful scale reference.
// See implementation.md §6, §7.6.
import * as React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { Dimensions } from "@/lib/schema/object";
import { loadCatalogModel } from "@/lib/geometry/catalog";

type PrimitiveShape = "box" | "cylinder" | "sphere" | "cone";

interface Props {
  modelId: string;
  url?: string;
  hash?: string;
  primitiveShape?: PrimitiveShape;
  dimensions: Dimensions;
  color: string;
  opacity?: number;
  onSelect: () => void;
}

/** Solid, calibrated primitive used for catalog items without a GLB asset. */
function PrimitiveCatalogMesh({
  shape,
  dimensions,
  color,
  opacity = 1,
  onSelect,
}: {
  shape: PrimitiveShape;
  dimensions: Dimensions;
  color: string;
  opacity?: number;
  onSelect: () => void;
}) {
  // Unit geometries (extent 1) scaled to the true mm bounding box. Base-aligned:
  // the object spans [0, height] on Y, so center sits at height/2.
  const scale: [number, number, number] = [
    dimensions.width,
    dimensions.height,
    dimensions.depth,
  ];
  return (
    <mesh
      position={[0, dimensions.height / 2, 0]}
      scale={scale}
      castShadow
      receiveShadow
      onClick={(e) => (e.stopPropagation(), onSelect())}
    >
      {shape === "cylinder" ? (
        <cylinderGeometry args={[0.5, 0.5, 1, 48]} />
      ) : shape === "sphere" ? (
        <sphereGeometry args={[0.5, 48, 32]} />
      ) : shape === "cone" ? (
        <coneGeometry args={[0.5, 1, 48]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshStandardMaterial
        color={color}
        metalness={0.1}
        roughness={0.55}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

export function CatalogContent({
  url,
  hash,
  primitiveShape,
  dimensions,
  color,
  opacity = 1,
  onSelect,
}: Props) {
  const [object, setObject] = React.useState<THREE.Object3D | null>(null);
  const [failed, setFailed] = React.useState(false);
  const invalidate = useThree((s) => s.invalidate);

  React.useEffect(() => {
    if (!url) return; // primitive-backed item: nothing to load
    let cancelled = false;
    setObject(null);
    setFailed(false);
    loadCatalogModel(url, dimensions, hash)
      .then((m) => {
        if (cancelled) return;
        setObject(m.object);
        invalidate(); // frameloop="demand": render once the model is ready
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[catalog] load failed", url, err);
        setFailed(true); // degrade to a solid calibrated primitive
        invalidate();
      });
    return () => {
      cancelled = true;
    };
  }, [url, hash, dimensions, invalidate]);

  // No GLB (or a failed load) → render a solid calibrated primitive.
  if (!url || failed) {
    return (
      <PrimitiveCatalogMesh
        shape={primitiveShape ?? "box"}
        dimensions={dimensions}
        color={color}
        opacity={opacity}
        onSelect={onSelect}
      />
    );
  }

  // Base-aligned center for boxes spanning [0, height] on Y.
  const centerY = dimensions.height / 2;

  if (!object) {
    // Calibrated placeholder: correct bounding box so scale is right pre-load.
    return (
      <mesh position={[0, centerY, 0]} onClick={(e) => (e.stopPropagation(), onSelect())}>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.25}
          wireframe
        />
      </mesh>
    );
  }

  return (
    <group onClick={(e) => (e.stopPropagation(), onSelect())}>
      <primitive object={object} />
    </group>
  );
}
