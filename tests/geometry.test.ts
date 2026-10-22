import assert from "node:assert/strict";
import test from "node:test";
import { dimensionsFor } from "../src/content";
import { exact, fraction, parseDimension } from "../src/core/fraction";
import { measuredRow, section, slope } from "../src/core/geometry";
import { initial, readState, writeState } from "../src/core/state";

test("the written and worked dimensions of 59 remain different; neither is its printed 5 1/2 result", () => {
  const written = slope(dimensionsFor("59", "written")),
    worked = slope(dimensionsFor("59", "working"));
  assert.equal(exact(written.palms), "7/3");
  assert.equal(exact(worked.palms), "21/4");
  assert.notEqual(exact(worked.palms), "11/2");
});
test("the inverse exercise retains 93 1/3 exactly, and face/corner sections use different horizontal distances", () => {
  const d = dimensionsFor("57", "working");
  assert.equal(exact(d.height), "280/3");
  assert.equal(exact(slope(d).palms), "21/4");
  const face = section(d, "face"),
    corner = section(d, "corner");
  assert(corner.angle < face.angle);
  assert(Math.abs(corner.run / face.run - Math.SQRT2) < 1e-14);
});
test("the reciprocal in 60 is not silently substituted for its inward measure", () => {
  const r = measuredRow(dimensionsFor("60", "written"));
  assert.equal(r.risePerRun, "4");
  assert.equal(r.runPerCubit, "1/4");
  assert.equal(r.palms, "7/4");
});
test("dimension input accepts exact mixed numbers and rejects ambiguous, unbounded or singular values", () => {
  assert.deepEqual(parseDimension("93 1/3"), fraction(280, 3));
  assert.deepEqual(parseDimension("0.01"), fraction(1, 100));
  for (const input of [
    "0",
    "-2",
    "1/0",
    "1e9",
    "Infinity",
    "NaN",
    "1/1000",
    "501",
    "1/2/3",
    "1 2 3/4",
    "<script>",
    "9".repeat(30000),
  ])
    assert.equal(parseDimension(input), null, input.slice(0, 30));
});
test("a shared source reading and a different experiment both survive without rewriting the source dimensions", () => {
  const state = {
    ...initial(),
    problem: "59" as const,
    step: 4,
    reading: "working" as const,
    lab: { base: fraction(140), height: fraction(280, 3) },
    section: "corner" as const,
  };
  assert.deepEqual(readState(writeState(state)), state);
  assert.equal(exact(dimensionsFor(state.problem, state.reading).base), "12");
  assert.deepEqual(readState("?p=unknown&step=Infinity&base=12&height=0"), initial());
});
