"use client";

// Persist user-built models so they are re-editable and optionally findable by
// others. When Supabase is configured (and the user is authenticated) it saves to
// the `models` table via /api/models; otherwise it falls back to localStorage so
// anonymous building works in dev. See implementation.md §7 (Phase 2 save).
import { z } from "zod";
import { nanoid } from "nanoid";
import { SavedModelSchema, type SavedModel } from "./schema";

// Re-export so existing importers (build pages) keep their import path.
export { SavedModelSchema };
export type { SavedModel };

const LS_KEY = "scalebench:models";

function readLocal(): SavedModel[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return z.array(SavedModelSchema).parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeLocal(models: SavedModel[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(models));
}

export interface SaveResult {
  model: SavedModel;
  persisted: "db" | "local";
}

export async function saveModel(input: {
  name: string;
  source: "lathe" | "csg";
  shapeDef: SavedModel["shapeDef"];
  dimensions: SavedModel["dimensions"];
  visibility?: "private" | "public";
}): Promise<SaveResult> {
  const model: SavedModel = SavedModelSchema.parse({
    id: nanoid(10),
    name: input.name,
    source: input.source,
    shapeDef: input.shapeDef,
    dimensions: input.dimensions,
    visibility: input.visibility ?? "private",
    createdAt: new Date().toISOString(),
  });

  // Try the DB first; fall back to localStorage on any failure (unconfigured,
  // unauthenticated, RLS, network).
  try {
    const res = await fetch("/api/models", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(model),
    });
    if (res.ok) return { model, persisted: "db" };
  } catch {
    // ignore -> local fallback
  }

  const all = readLocal();
  all.unshift(model);
  writeLocal(all);
  return { model, persisted: "local" };
}

export function listLocalModels(source?: "lathe" | "csg"): SavedModel[] {
  const all = readLocal();
  return source ? all.filter((m) => m.source === source) : all;
}

export function deleteLocalModel(id: string) {
  writeLocal(readLocal().filter((m) => m.id !== id));
}

// Delete a model wherever it lives. A given model is either in the DB (signed-in
// save) or localStorage, but both calls are idempotent and safe, so we run both:
// the DB endpoint no-ops when unconfigured/unauthenticated/not-owned, and the local
// remove is a no-op when the id isn't present.
export async function deleteModel(id: string): Promise<void> {
  deleteLocalModel(id);
  try {
    await fetch(`/api/models?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch {
    // ignore — local copy (if any) is already gone
  }
}

// Map a DB row (snake_case mm columns) to the client SavedModel shape.
function rowToSavedModel(r: Record<string, unknown>): SavedModel | null {
  const parsed = SavedModelSchema.safeParse({
    id: r.id,
    name: r.name,
    source: r.source,
    shapeDef: r.shape_def,
    dimensions: {
      width: r.width_mm,
      height: r.height_mm,
      depth: r.depth_mm,
    },
    visibility: r.visibility,
    createdAt: r.created_at,
  });
  return parsed.success ? parsed.data : null;
}

// The signed-in user's models from the DB. Returns [] when unconfigured,
// unauthenticated, or on any failure — callers merge this with localStorage.
export async function fetchDbModels(
  source?: "lathe" | "csg",
): Promise<SavedModel[]> {
  try {
    const res = await fetch(
      source ? `/api/models?source=${source}` : "/api/models",
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { models?: Record<string, unknown>[] };
    return (json.models ?? [])
      .map(rowToSavedModel)
      .filter((m): m is SavedModel => m !== null);
  } catch {
    return [];
  }
}

// "My builds": DB models (for signed-in users) merged with localStorage, de-duped
// by id (DB wins). Async because the DB read is a network call; pair it with a
// synchronous listLocalModels() first render for an instant list.
export async function listMyModels(
  source?: "lathe" | "csg",
): Promise<SavedModel[]> {
  const db = await fetchDbModels(source);
  const local = listLocalModels(source);
  const seen = new Set<string>();
  const merged: SavedModel[] = [];
  for (const m of [...db, ...local]) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    merged.push(m);
  }
  return merged;
}
