// Procedural composite catalog models must always produce schema-valid CSG that
// evaluates to real, non-degenerate geometry.
import { test } from "node:test";
import assert from "node:assert/strict";

import { COMPOSITES } from "../lib/catalog/composites";
import { CsgSourceSchema } from "../lib/schema/object";
import { buildCsg } from "../lib/geometry/csg";

const DIMS = { width: 1200, height: 900, depth: 700 };

for (const [slug, gen] of Object.entries(COMPOSITES)) {
  test(`composite "${slug}" builds valid, non-empty geometry`, () => {
    const nodes = gen(DIMS);
    assert.ok(nodes.length >= 1, "expected at least one node");

    // Nodes must satisfy the CSG schema (kinds, vec3 tuples, ops).
    const src = CsgSourceSchema.parse({ source: "csg", nodes });

    const geo = buildCsg(src);
    const pos = geo.getAttribute("position");
    assert.ok(pos && pos.count > 0, "geometry should have vertices");

    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    for (const v of [bb.min, bb.max]) {
      assert.ok(
        Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z),
        "bounding box must be finite",
      );
    }
    geo.dispose();
  });
}
