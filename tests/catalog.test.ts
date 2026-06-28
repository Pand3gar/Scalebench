// Catalog fuzzy-search tests (mimics Postgres FTS + pg_trgm behaviour).
import { test } from "node:test";
import assert from "node:assert/strict";

import { searchSeedCatalog, similarity } from "../lib/catalog/search";

test("exact substring match returns the model", () => {
  const r = searchSeedCatalog("helmet");
  assert.ok(r.some((m) => m.slug === "damaged-helmet"));
});

test("fuzzy/misspelled query still matches via trigram similarity", () => {
  const r = searchSeedCatalog("helmt"); // missing 'e'
  assert.ok(r.length > 0);
  assert.equal(r[0].slug, "damaged-helmet");
});

test("tag search matches (e.g. 'drink' -> water bottle)", () => {
  const r = searchSeedCatalog("drink");
  assert.ok(r.some((m) => m.slug === "water-bottle"));
});

test("empty query returns the full public catalog", () => {
  const r = searchSeedCatalog("");
  assert.ok(r.length >= 6);
});

test("nonsense query returns nothing", () => {
  const r = searchSeedCatalog("zzzxqwk");
  assert.equal(r.length, 0);
});

test("every catalog result carries strictly-positive dimensions", () => {
  for (const m of searchSeedCatalog("")) {
    assert.ok(m.widthMm > 0 && m.heightMm > 0 && m.depthMm > 0, m.name);
  }
});

test("similarity is symmetric and bounded [0,1]", () => {
  const s = similarity("bottle", "bottle");
  assert.ok(s > 0.99);
  assert.equal(similarity("abc", "abc"), similarity("abc", "abc"));
  assert.ok(similarity("abc", "xyz") >= 0);
});
