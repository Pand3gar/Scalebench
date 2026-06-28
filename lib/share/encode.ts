// Stateless share links via lz-string URL compression. See implementation.md §7.8.
import LZString from "lz-string";
import { SceneSchema, type Scene } from "@/lib/schema/scene";

/** Max compressed payload for a stateless link; above this, use DB-backed scenes. */
export const MAX_STATELESS_PAYLOAD = 8000;

export function encodeScene(scene: Scene): string {
  const json = JSON.stringify(scene);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeScene(payload: string): Scene | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(payload);
    if (!json) return null;
    return SceneSchema.parse(JSON.parse(json));
  } catch {
    return null;
  }
}

export function isStatelessable(scene: Scene): boolean {
  return encodeScene(scene).length <= MAX_STATELESS_PAYLOAD;
}
