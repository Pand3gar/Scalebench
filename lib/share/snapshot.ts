// WebGL canvas -> PNG. DOM-snapshot tools cannot capture WebGL, so we read the
// renderer's drawing buffer directly. See implementation.md §7.7.
import type * as THREE from "three";

/**
 * Capture the 3D view as a PNG data URL. Requires the renderer to be created with
 * `preserveDrawingBuffer: true` (set on <Canvas gl={{...}}>), and renders once in
 * the same tick as the read to guarantee a fresh buffer.
 */
export function captureScene(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
): string {
  gl.render(scene, camera);
  return gl.domElement.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
