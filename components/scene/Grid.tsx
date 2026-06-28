"use client";

// Ground plane + reference grid. Cell spacing = niceMm * scaleFactor world units,
// so each cell equals a clean real-world measure. See implementation.md §5.4.
import { Grid as DreiGrid } from "@react-three/drei";
import { SCENE_EXTENT } from "@/lib/engine/constants";
import { useGrid } from "@/lib/store/useSceneStore";

export function Grid() {
  const { cellWorld } = useGrid();
  // Fallback spacing when the scene is empty (no scale yet).
  const cell = cellWorld > 0 ? cellWorld : 1;

  return (
    <DreiGrid
      position={[0, 0, 0]}
      infiniteGrid
      cellSize={cell}
      cellThickness={0.6}
      cellColor="#d4d9e0"
      sectionSize={cell * 5}
      sectionThickness={1}
      sectionColor="#bcc4cf"
      fadeDistance={SCENE_EXTENT * 8}
      fadeStrength={1.5}
      followCamera={false}
    />
  );
}
