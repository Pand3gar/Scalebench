"use client";

// OrbitControls + stable framing derived from SCENE_EXTENT (not from the objects),
// so the composition stays put as objects change. See implementation.md §5.2, §7.10.
import * as React from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SCENE_EXTENT } from "@/lib/engine/constants";
import { glHandles } from "@/lib/scene/glRef";

export function CameraRig() {
  const controls = React.useRef<OrbitControlsImpl>(null);
  const { camera, gl, scene } = useThree();

  // Bridge live handles out for export capture.
  React.useEffect(() => {
    glHandles.gl = gl;
    glHandles.scene = scene;
    glHandles.camera = camera;
  }, [gl, scene, camera]);

  // Keyboard camera controls (a11y): arrows orbit, +/- zoom, Home resets.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const base = controls.current;
      if (!base) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      // These orbit helpers exist at runtime but aren't all in the public types.
      const c = base as unknown as {
        rotateLeft: (n: number) => void;
        rotateUp: (n: number) => void;
        dollyIn: (n: number) => void;
        dollyOut: (n: number) => void;
        update: () => void;
        reset: () => void;
      };
      const step = 0.18;
      switch (e.key) {
        case "ArrowLeft":
          c.rotateLeft(-step);
          break;
        case "ArrowRight":
          c.rotateLeft(step);
          break;
        case "ArrowUp":
          c.rotateUp(-step);
          break;
        case "ArrowDown":
          c.rotateUp(step);
          break;
        case "+":
        case "=":
          c.dollyIn(1.1);
          break;
        case "-":
          c.dollyOut(1.1);
          break;
        case "Home":
          c.reset();
          break;
        default:
          return;
      }
      c.update();
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={false}
      minDistance={SCENE_EXTENT * 0.05}
      maxDistance={SCENE_EXTENT * 6}
      target={[0, SCENE_EXTENT * 0.25, 0]}
    />
  );
}
