"use client";

// Hydrate the scene from a `?d=` stateless share payload on first load.
import * as React from "react";
import { decodeScene } from "./encode";
import { useSceneStore } from "@/lib/store/useSceneStore";

export function useLoadFromUrl() {
  const loadScene = useSceneStore((s) => s.loadScene);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get("d");
    if (!payload) return;
    const scene = decodeScene(payload);
    if (scene) loadScene(scene);
  }, [loadScene]);
}
