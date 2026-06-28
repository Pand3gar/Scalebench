"use client";

// The react-three-fiber Canvas wrapper: lighting (HDRI/IBL via drei Environment),
// reference grid, calibrated objects, orbit camera.
// preserveDrawingBuffer + frameloop="demand" per the perf budget (§7.11) and to
// allow WebGL canvas capture for export (§7.7).
import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";

import { useSceneStore, useScaleFactor } from "@/lib/store/useSceneStore";
import { computeRowLayout } from "@/lib/engine/layout";
import { SCENE_EXTENT } from "@/lib/engine/constants";

import { CameraRig } from "./CameraRig";
import { Grid } from "./Grid";
import { SceneObjectMesh } from "./SceneObjectMesh";

function SceneContents() {
  const objects = useSceneStore((s) => s.objects);
  const select = useSceneStore((s) => s.select);
  const scaleFactor = useScaleFactor();

  const layout = React.useMemo(
    () => computeRowLayout(objects.map((o) => o.dimensions), scaleFactor),
    [objects, scaleFactor],
  );

  return (
    <>
      {/* Image-based lighting for realistic surfaces. */}
      <Environment preset="city" />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[SCENE_EXTENT, SCENE_EXTENT * 1.5, SCENE_EXTENT]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Grid />
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.4}
        scale={SCENE_EXTENT * 4}
        blur={2}
        far={SCENE_EXTENT}
      />

      {scaleFactor > 0 &&
        objects.map((obj, i) => (
          <SceneObjectMesh
            key={obj.id}
            object={obj}
            layoutX={layout[i]?.x ?? 0}
            scaleFactor={scaleFactor}
          />
        ))}

      {/* Click empty space to deselect. */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => select(null)}
        visible={false}
      >
        <planeGeometry args={[SCENE_EXTENT * 40, SCENE_EXTENT * 40]} />
        <meshBasicMaterial />
      </mesh>

      <CameraRig />
    </>
  );
}

export function SceneCanvas() {
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{
        position: [SCENE_EXTENT * 1.1, SCENE_EXTENT * 0.9, SCENE_EXTENT * 1.6],
        fov: 45,
        near: 0.01,
        far: SCENE_EXTENT * 50,
      }}
    >
      <color attach="background" args={["#ede9df"]} />
      <React.Suspense fallback={null}>
        <SceneContents />
      </React.Suspense>
    </Canvas>
  );
}
