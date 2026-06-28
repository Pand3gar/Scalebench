// User-built model persistence. Requires Supabase + an authenticated user (RLS
// enforces ownership). When unconfigured the client falls back to localStorage.
// See implementation.md §7.12 / Phase 2 save.
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SavedModelSchema } from "@/lib/models/schema";

export const runtime = "nodejs";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "model"
  );
}

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured; saved locally instead." },
      { status: 503 },
    );
  }

  // Require an authenticated user — RLS enforces author_id ownership.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to save models to the database." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = SavedModelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid model" }, { status: 400 });
  }
  const m = parsed.data;

  const { data, error } = await supabase
    .from("models")
    .insert({
      name: m.name,
      slug: `${slugify(m.name)}-${m.id.slice(0, 6)}`,
      width_mm: m.dimensions.width,
      height_mm: m.dimensions.height,
      depth_mm: m.dimensions.depth,
      source: m.source,
      shape_def: m.shapeDef,
      visibility: m.visibility,
      author_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ model: data });
}

// "My builds" — the signed-in user's own models. RLS also permits selecting your
// own rows; we filter by author_id so this is the user's library, not a public feed.
// Returns [] (not an error) when unconfigured or unauthenticated so the UI can fall
// back to localStorage cleanly.
export async function GET(req: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ models: [] });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ models: [] });

  const source = new URL(req.url).searchParams.get("source");
  let query = supabase.from("models").select("*").eq("author_id", user.id);
  if (source === "lathe" || source === "csg") {
    query = query.eq("source", source);
  }
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ models: data ?? [] });
}

// Delete one of the signed-in user's own models. RLS ("delete own") enforces
// ownership. Returns { ok: true } when unconfigured/unauthenticated so the client
// can still delete the local copy without surfacing an error.
export async function DELETE(req: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ ok: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: true });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("models")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
