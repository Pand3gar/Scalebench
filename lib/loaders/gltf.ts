// GLTFLoader configured with Draco + Meshopt decoders. See implementation.md §7.6.
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

// Decoder served from the gstatic CDN (no wasm to bundle). Override via
// NEXT_PUBLIC_DRACO_DECODER_PATH (e.g. "/draco/") to self-host per the blueprint.
const DRACO_DECODER_PATH =
  process.env.NEXT_PUBLIC_DRACO_DECODER_PATH ??
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

let loader: GLTFLoader | null = null;

export function makeGltfLoader(): GLTFLoader {
  if (loader) return loader;
  const l = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_DECODER_PATH);
  l.setDRACOLoader(draco);
  l.setMeshoptDecoder(MeshoptDecoder);
  loader = l;
  return l;
}
