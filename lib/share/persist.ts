"use client";

// Client helpers for DB-backed (persisted) share + embed links. See §7.8.
import type { Scene } from "@/lib/schema/scene";

export async function persistScene(scene: Scene): Promise<string> {
  const res = await fetch("/api/scenes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(scene),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error ?? "Failed to save scene");
  }
  const { id } = (await res.json()) as { id: string };
  return id;
}

export const sceneUrl = (id: string) =>
  `${window.location.origin}/s/${id}`;

export const embedUrl = (id: string) =>
  `${window.location.origin}/embed/${id}`;

export const embedSnippet = (id: string) =>
  `<iframe src="${embedUrl(id)}" width="800" height="500" style="border:0;border-radius:12px" loading="lazy" allowfullscreen title="ScaleBench comparison"></iframe>`;
