import assert from "node:assert/strict";
import test from "node:test";
import { exact, fraction as f } from "../src/core/fraction";
import {
  frustumJSON,
  initialFrustum,
  parseFrustumQuery,
  readFrustumJSON,
  volumes,
} from "../src/core/frustum";

test("a shared rational drawing reopens exactly; the papyrus numbers do not become its input", () => {
  const parsed = parseFrustumQuery(
    "?a=7%2F2&b=1%201%2F3&h=9%2F4&spread=83&cut=77&turn=70&part=corners&step=1&source=102",
  );
  assert.equal(parsed.warning, "");
  const s = readFrustumJSON(frustumJSON(parsed.state));
  assert.deepEqual(s, parsed.state);
  assert.equal(exact(s.top), "4/3");
  assert.equal(exact(volumes(initialFrustum()).total), "56");
  assert.notEqual(exact(volumes(s).total), "56");
});
test("impossible, ambiguous and out-of-range links fall back as a whole", () => {
  for (const query of [
    "?a=3&b=4",
    "?a=0",
    "?h=1/1000",
    "?a=4&a=5",
    "?spread=NaN",
    "?cut=101",
    "?source=103",
    "?step=6",
    "?part=other",
    "?b=0/0",
    "?turn=1e2",
  ]) {
    const parsed = parseFrustumQuery(query);
    assert.ok(parsed.warning, query);
    assert.deepEqual(parsed.state, initialFrustum());
  }
  assert.equal(parseFrustumQuery("?b=0").warning, "");
  assert.equal(parseFrustumQuery("?b=4").warning, "");
});
test("import rejects malformed files rather than partially accepting a different drawing", () => {
  const original = JSON.parse(frustumJSON(initialFrustum()));
  const invalid = [
    null,
    [],
    {},
    { ...original, version: 2 },
    { ...original, extra: 1 },
    { ...original, dimensions: { ...original.dimensions, upperSide: "5" } },
    { ...original, dimensions: { ...original.dimensions, height: 6 } },
    { ...original, view: { ...original.view, cut: 1.5 } },
    { ...original, view: { ...original.view, source: 999 } },
    { ...original, view: { ...original.view, part: "<script>" } },
  ];
  for (const j of invalid) assert.throws(() => readFrustumJSON(JSON.stringify(j)));
  assert.throws(() => readFrustumJSON(" ".repeat(16001)));
  assert.throws(() => volumes({ base: f(2), top: f(4), height: f(6) }));
});
