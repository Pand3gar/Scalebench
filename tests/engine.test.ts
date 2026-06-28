// Pure-engine tests (no three.js / DOM). Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import { computeDmax, computeScaleFactor } from "../lib/engine/scale";
import { niceNumber, computeGrid } from "../lib/engine/grid";
import { toMm, fromMm, formatMm } from "../lib/engine/units";
import { computeRowLayout } from "../lib/engine/layout";
import { SCENE_EXTENT } from "../lib/engine/constants";

test("Dmax is the largest single dimension across all objects (mm)", () => {
  const dims = [
    { width: 50, height: 50, depth: 50 }, // 5 cm cube
    { width: 200, height: 2000, depth: 200 }, // 2 m tall
  ];
  assert.equal(computeDmax(dims), 2000);
});

test("largest dimension maps to SCENE_EXTENT; others scale by the same factor", () => {
  const big = { width: 200, height: 2000, depth: 200 }; // 2 m
  const small = { width: 50, height: 50, depth: 50 }; // 5 cm
  const sf = computeScaleFactor([big, small]);
  // The 2 m object spans exactly SCENE_EXTENT.
  assert.equal(big.height * sf, SCENE_EXTENT);
  // The 5 cm object is 50/2000 = 1/40 of the scene extent.
  assert.ok(Math.abs(small.height * sf - SCENE_EXTENT / 40) < 1e-9);
});

test("empty scene yields a zero scale factor (no NaN)", () => {
  assert.equal(computeScaleFactor([]), 0);
});

test("niceNumber snaps to 1/2/5 × 10^k", () => {
  assert.equal(niceNumber(1), 1);
  assert.equal(niceNumber(1.3), 1);
  assert.equal(niceNumber(1.7), 2);
  assert.equal(niceNumber(4), 5);
  assert.equal(niceNumber(8), 10);
  assert.equal(niceNumber(37), 50);
  assert.equal(niceNumber(230), 200);
});

test("grid cell renders at niceMm * scaleFactor world units", () => {
  const sf = computeScaleFactor([{ width: 1000, height: 1000, depth: 1000 }]); // 1 m -> 10 wu
  const grid = computeGrid(sf);
  assert.ok(grid.cellMm > 0);
  assert.ok(Math.abs(grid.cellWorld - grid.cellMm * sf) < 1e-9);
});

test("unit conversion round-trips through mm", () => {
  assert.equal(toMm(1, "m"), 1000);
  assert.equal(toMm(1, "ft"), 304.8);
  assert.ok(Math.abs(fromMm(toMm(12, "in"), "in") - 12) < 1e-9);
});

test("switching display unit changes label output (m vs ft)", () => {
  const mm = 1828.8; // 6 ft == 1.8288 m
  assert.equal(formatMm(mm, "m"), "1.829 m");
  assert.equal(formatMm(mm, "ft"), "6 ft");
});

test("row layout centers the row about x = 0", () => {
  const dims = [
    { width: 100, height: 100, depth: 100 },
    { width: 300, height: 300, depth: 300 },
  ];
  const sf = computeScaleFactor(dims);
  const layout = computeRowLayout(dims, sf);
  const left = layout[0].x - layout[0].worldWidth / 2;
  const right = layout[1].x + layout[1].worldWidth / 2;
  assert.ok(Math.abs(left + right) < 1e-9, "row should be symmetric about 0");
});
