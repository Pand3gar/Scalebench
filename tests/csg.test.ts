// CSG evaluation tests (uses three + three-bvh-csg, headless).
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildCsg, csgDimensions } from "../lib/geometry/csg";
import type { CsgNode } from "../lib/schema/object";

const box = (
  id: string,
  w: number,
  h: number,
  d: number,
  pos: [number, number, number] = [0, 0, 0],
  op: CsgNode["op"] = "ADDITION",
): CsgNode => ({
  id,
  primitive: { kind: "box", width: w, height: h, depth: d },
  position: pos,
  rotation: [0, 0, 0],
  op,
});

test("single box evaluates to its exact bounding box (mm)", () => {
  const dims = csgDimensions({ source: "csg", nodes: [box("a", 100, 50, 80)] });
  assert.ok(Math.abs(dims.width - 100) < 1e-3);
  assert.ok(Math.abs(dims.height - 50) < 1e-3);
  assert.ok(Math.abs(dims.depth - 80) < 1e-3);
});

test("subtraction yields a valid non-empty geometry no larger than the base", () => {
  const nodes: CsgNode[] = [
    box("base", 160, 50, 100),
    box("hole", 40, 80, 40, [50, 0, 0], "SUBTRACTION"),
  ];
  const geo = buildCsg({ source: "csg", nodes });
  const pos = geo.getAttribute("position");
  assert.ok(pos && pos.count > 0, "geometry should have vertices");
  const dims = csgDimensions({ source: "csg", nodes });
  assert.ok(dims.width <= 160 + 1e-3);
  assert.ok(dims.depth <= 100 + 1e-3);
  geo.dispose();
});

test("addition of an offset box extends the bounding box", () => {
  const nodes: CsgNode[] = [
    box("a", 100, 100, 100),
    box("b", 100, 100, 100, [100, 0, 0], "ADDITION"),
  ];
  const dims = csgDimensions({ source: "csg", nodes });
  // Two 100mm boxes, centers 100mm apart -> spans ~200mm on X.
  assert.ok(Math.abs(dims.width - 200) < 1, `width was ${dims.width}`);
});
