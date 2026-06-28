// Local catalog search — fuzzy name + tag matching that mimics Postgres FTS +
// pg_trgm, used as the dev fallback when Supabase is not configured. See §7.12.
import { SEED_CATALOG } from "./seed";
import type { CatalogSearchResult, ModelMetadata } from "@/lib/schema/model";

function trigrams(s: string): Set<string> {
  const t = `  ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
  const out = new Set<string>();
  for (let i = 0; i < t.length - 2; i++) out.add(t.slice(i, i + 3));
  return out;
}

/** Jaccard trigram similarity, ~ pg_trgm.similarity(). */
export function similarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const g of ta) if (tb.has(g)) inter += 1;
  return inter / (ta.size + tb.size - inter);
}

function toResult(m: ModelMetadata): CatalogSearchResult {
  return {
    id: m.id,
    name: m.name,
    slug: m.slug,
    widthMm: m.widthMm,
    heightMm: m.heightMm,
    depthMm: m.depthMm,
    glbUrl: m.glbUrl,
    shape: m.shape,
    thumbUrl: m.thumbUrl,
    contentHash: m.contentHash,
    tags: m.tags,
  };
}

export function searchSeedCatalog(query: string): CatalogSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return SEED_CATALOG.filter((m) => m.visibility === "public").map(toResult);
  }
  const scored = SEED_CATALOG.filter((m) => m.visibility === "public")
    .map((m) => {
      const haystack = `${m.name} ${m.tags.join(" ")}`.toLowerCase();
      const substr = haystack.includes(q) ? 1 : 0;
      const sim = Math.max(
        similarity(m.name, q),
        ...m.tags.map((t) => similarity(t, q)),
      );
      return { m, score: substr * 0.6 + sim };
    })
    .filter((x) => x.score > 0.12)
    .sort((a, b) => b.score - a.score);
  return scored.map((x) => toResult(x.m));
}
