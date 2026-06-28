// Catalog GLB pipeline: load (IndexedDB → network), parse, and uniform-calibrate
// the model so its true extents match the declared real-world dimensions.
// Declared dimensions are authoritative. See implementation.md §6, §7.6.
import * as THREE from "three";
import type { Dimensions } from "@/lib/schema/object";
import { makeGltfLoader } from "@/lib/loaders/gltf";
import { getCachedGlb, putCachedGlb } from "@/lib/loaders/cache";

// Session cache of the raw parsed template scene, keyed by cache key.
const templateCache = new Map<string, Promise<THREE.Group>>();

function cacheKey(url: string, hash?: string): string {
  return hash ?? url;
}

async function fetchGlb(url: string, key: string): Promise<ArrayBuffer> {
  const cached = await getCachedGlb(key);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch GLB: ${res.status}`);
  const buf = await res.arrayBuffer();
  void putCachedGlb(key, buf); // best-effort persist
  return buf;
}

function loadTemplate(url: string, hash?: string): Promise<THREE.Group> {
  const key = cacheKey(url, hash);
  let promise = templateCache.get(key);
  if (!promise) {
    promise = (async () => {
      const buf = await fetchGlb(url, key);
      const loader = makeGltfLoader();
      const gltf = await loader.parseAsync(buf, "");
      return gltf.scene as THREE.Group;
    })();
    templateCache.set(key, promise);
  }
  return promise;
}

export interface CalibratedModel {
  object: THREE.Object3D; // mm-space, x/z centered, base on y = 0
  size: THREE.Vector3; // true post-calibration extents (mm)
}

/**
 * Load a catalog model and return a fresh, calibrated clone (mm-space). Uniform
 * scaling preserves the modeller's proportions; `min` of the per-axis ratios keeps
 * the model within the declared box (never larger than its measurement).
 */
export async function loadCatalogModel(
  url: string,
  dimensions: Dimensions,
  hash?: string,
): Promise<CalibratedModel> {
  const template = await loadTemplate(url, hash);
  const obj = template.clone(true);

  const holder = new THREE.Group();
  holder.add(obj);

  // Measure raw, derive uniform scale, apply.
  let box = new THREE.Box3().setFromObject(holder);
  const rawSize = box.getSize(new THREE.Vector3());
  const s = Math.min(
    dimensions.width / (rawSize.x || 1),
    dimensions.height / (rawSize.y || 1),
    dimensions.depth / (rawSize.z || 1),
  );
  holder.scale.setScalar(s);

  // Re-measure, center x/z, base to y = 0.
  box = new THREE.Box3().setFromObject(holder);
  const center = box.getCenter(new THREE.Vector3());
  const min = box.min.clone();
  holder.position.x -= center.x;
  holder.position.z -= center.z;
  holder.position.y -= min.y;

  const size = box.getSize(new THREE.Vector3());
  return { object: holder, size };
}
