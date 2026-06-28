// Lathe anchor binding + intent heuristic tests (pure logic).
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  LATHE_TEMPLATES,
  deriveAnchors,
  applyAnchors,
  latheDimensions,
} from "../lib/builders/lathe";
import { templateForIntent, builderHref } from "../lib/builders/intent";

const approx = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;

test("deriveAnchors reads height/body/mouth/base from the bottle profile", () => {
  const a = deriveAnchors(LATHE_TEMPLATES.bottle.profile);
  assert.equal(a.totalHeight, 250);
  assert.equal(a.bodyDiameter, 80); // 2 * max radius (40)
  assert.equal(a.mouthDiameter, 28); // 2 * top vertex radius (14)
  assert.equal(a.baseDiameter, 70); // 2 * bottom vertex radius (35)
});

test("applyAnchors rescales the profile and the derived anchors round-trip", () => {
  const profile = LATHE_TEMPLATES.bottle.profile;
  const target = {
    totalHeight: 500,
    bodyDiameter: 100,
    mouthDiameter: 40,
    baseDiameter: 60,
  };
  const next = applyAnchors(profile, target);
  const got = deriveAnchors(next);
  assert.ok(approx(got.totalHeight, 500, 1e-6));
  assert.ok(approx(got.bodyDiameter, 100, 1e-6));
  assert.ok(approx(got.mouthDiameter!, 40, 1e-6));
  assert.ok(approx(got.baseDiameter!, 60, 1e-6));
});

test("latheDimensions maps body diameter -> width/depth and height", () => {
  const d = latheDimensions({ totalHeight: 250, bodyDiameter: 80 });
  assert.deepEqual(d, { width: 80, height: 250, depth: 80 });
});

test("intent: round/symmetric names go to the lathe with a fitting template", () => {
  assert.deepEqual(templateForIntent("bottle"), { mode: "lathe", template: "bottle" });
  assert.deepEqual(templateForIntent("thermos"), { mode: "lathe", template: "bottle" });
  assert.deepEqual(templateForIntent("wine glass"), { mode: "lathe", template: "glass" });
  assert.deepEqual(templateForIntent("coffee mug"), { mode: "lathe", template: "cup" });
});

test("intent: non-symmetric names go to the CSG builder", () => {
  assert.equal(templateForIntent("game controller").mode, "csg");
  assert.equal(templateForIntent("smartwatch").mode, "csg");
});

test("builderHref carries name + template", () => {
  assert.ok(builderHref("thermos").startsWith("/build/lathe?"));
  assert.match(builderHref("thermos"), /name=thermos/);
  assert.match(builderHref("thermos"), /template=bottle/);
  assert.ok(builderHref("controller").startsWith("/build/csg?"));
});
