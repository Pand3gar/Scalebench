// Persisted scenes for DB-backed share + embed links. POST stores a scene and
// returns a short id; GET?id= returns the scene. Read-only for embeds; no write
// APIs are exposed to the public iframe. See implementation.md §7.8, §9.
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { SceneSchema } from "@/lib/schema/scene";
import { getScene, putScene, isValidSceneId } from "@/lib/scenes/serverStore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = SceneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid scene" }, { status: 400 });
  }
  // Guard against unbounded payloads.
  if (JSON.stringify(parsed.data).length > 512_000) {
    return NextResponse.json({ error: "Scene too large" }, { status: 413 });
  }
  const id = nanoid(10);
  try {
    await putScene(id, parsed.data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
  return NextResponse.json({ id });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!isValidSceneId(id)) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }
  const scene = await getScene(id);
  if (!scene) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ scene });
}
