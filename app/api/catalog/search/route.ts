// Catalog search endpoint. Uses Postgres FTS + pg_trgm (via the `search_models`
// RPC) when Supabase is configured; otherwise falls back to the local seed
// catalog so the app runs without credentials. See implementation.md §7.12.
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { searchSeedCatalog } from "@/lib/catalog/search";
import type { CatalogSearchResult } from "@/lib/schema/model";

export const runtime = "nodejs";

// Map a snake_case DB row to the camelCase DTO.
function rowToResult(row: Record<string, unknown>): CatalogSearchResult {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    widthMm: Number(row.width_mm),
    heightMm: Number(row.height_mm),
    depthMm: Number(row.depth_mm),
    glbUrl: row.glb_url ? String(row.glb_url) : undefined,
    shape: row.shape
      ? (String(row.shape) as "box" | "cylinder" | "sphere" | "cone")
      : undefined,
    thumbUrl: row.thumb_url ? String(row.thumb_url) : undefined,
    contentHash: row.content_hash ? String(row.content_hash) : undefined,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase.rpc("search_models", { query: q });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const results = (data ?? []).map((r: Record<string, unknown>) =>
      rowToResult(r),
    );
    return NextResponse.json({ results, source: "supabase" });
  }

  // Local fallback.
  return NextResponse.json({ results: searchSeedCatalog(q), source: "seed" });
}
