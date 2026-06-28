// Module-level holder for the live three.js renderer/scene/camera, so DOM-side
// dialogs (export) can capture the WebGL canvas. Populated by <CaptureBridge/>.
import type * as THREE from "three";

interface GlHandles {
  gl: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
}

export const glHandles: GlHandles = { gl: null, scene: null, camera: null };
