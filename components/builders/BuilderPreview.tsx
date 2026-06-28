"use client";

// Generic 3D preview for the builders: auto-frames a geometry and lets the user
// orbit. Used by both the lathe and CSG workflows.
import * as React from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls, Environment, Grid } from "@react-three/drei";

function PreviewMesh({
  geometry,
  color,
}: {
  geometry: THREE.BufferGeometry;
  color: string;
}) {
  return (
    <Bounds fit clip observe margin={1.3}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.5} />
      </mesh>
    </Bounds>
  );
}

export function BuilderPreview({
  geometry,
  color = "#5ba3e6",
}: {
  geometry: THREE.BufferGeometry | null;
  color?: string;
}) {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-[#edf0f3]">
      <Canvas
        camera={{ position: [1, 0.8, 1.6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Environment preset="city" />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 2]} intensity={1} />
        <Grid
          infiniteGrid
          cellSize={0.5}
          sectionSize={2.5}
          cellColor="#d4d9e0"
          sectionColor="#bcc4cf"
          fadeDistance={30}
        />
        {geometry ? <PreviewMesh geometry={geometry} color={color} /> : null}
        <OrbitControls makeDefault enableDamping={false} />
      </Canvas>
    </div>
  );
}
