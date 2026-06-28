// Server-side persisted-scene store. Uses Supabase (`scenes` table) when
// configured; otherwise a filesystem fallback under the OS temp dir so DB-backed
// share/embed links work end-to-end in dev. See implementation.md §7.8.
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SceneSchema, type Scene } from "@/lib/schema/scene";

const DIR = path.join(os.tmpdir(), "scalebench-scenes");

/** Short ids are URL-safe (nanoid alphabet). Reject anything else (path safety). */
export function isValidSceneId(id: string): boolean {
  return /^[A-Za-z0-9_-]{6,32}$/.test(id);
}

async function fileGet(id: string): Promise<Scene | null> {
  try {
    const raw = await fs.readFile(path.join(DIR, `${id}.json`), "utf8");
    return SceneSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function filePut(id: string, scene: Scene): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(path.join(DIR, `${id}.json`), JSON.stringify(scene), "utf8");
}

export async function putScene(id: string, scene: Scene): Promise<void> {
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from("scenes").insert({ id, data: scene });
    if (error) throw new Error(error.message);
    return;
  }
  await filePut(id, scene);
}

export async function getScene(id: string): Promise<Scene | null> {
  if (!isValidSceneId(id)) return null;
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("scenes")
      .select("data")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const parsed = SceneSchema.safeParse(data.data);
    return parsed.success ? parsed.data : null;
  }
  return fileGet(id);
}
