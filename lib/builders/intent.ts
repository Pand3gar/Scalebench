// Intent -> builder heuristic for the search-to-builder bridge. Names matching
// rotationally-symmetric objects open the lathe builder with a fitting template;
// everything else opens the CSG builder. See implementation.md §7.4.
import { LATHE_TEMPLATES, DEFAULT_LATHE_TEMPLATE } from "./lathe";

// keyword -> template id
const LATHE_KEYWORDS: Record<string, string> = {
  bottle: "bottle",
  flask: "bottle",
  thermos: "bottle",
  water: "bottle",
  glass: "glass",
  tumbler: "glass",
  wine: "glass",
  can: "can",
  soda: "can",
  tin: "can",
  jar: "jar",
  pot: "jar",
  vase: "vase",
  cup: "cup",
  mug: "cup",
  coffee: "cup",
};

export interface BuilderIntent {
  mode: "lathe" | "csg";
  template?: string;
}

export function templateForIntent(name: string): BuilderIntent {
  const q = name.trim().toLowerCase();
  if (!q) return { mode: "csg" };

  // Direct template-name hit.
  if (LATHE_TEMPLATES[q]) return { mode: "lathe", template: q };

  // Keyword scan.
  for (const [kw, template] of Object.entries(LATHE_KEYWORDS)) {
    if (q.includes(kw)) return { mode: "lathe", template };
  }

  // Default lathe template only if a generic "round" hint appears; else CSG.
  if (/round|cylind|tube|barrel/.test(q)) {
    return { mode: "lathe", template: DEFAULT_LATHE_TEMPLATE };
  }
  return { mode: "csg" };
}

/** Build the builder route for an intent, carrying the name (+ template). */
export function builderHref(name: string): string {
  const intent = templateForIntent(name);
  const params = new URLSearchParams();
  if (name.trim()) params.set("name", name.trim());
  if (intent.mode === "lathe" && intent.template) {
    params.set("template", intent.template);
    return `/build/lathe?${params.toString()}`;
  }
  return `/build/csg?${params.toString()}`;
}
