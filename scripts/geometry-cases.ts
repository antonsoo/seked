import { dimensionsFor, problemIds } from "../src/content";
import { exact, fraction } from "../src/core/fraction";
import { measuredRow, sectionCoordinates } from "../src/core/geometry";
import { reckon } from "../src/core/reckoning";

const result = [];
for (const p of problemIds) {
  for (const reading of p === "59" ? (["written", "working"] as const) : (["written"] as const)) {
    const d = dimensionsFor(p, reading);
    result.push({
      category: "source",
      p,
      reading,
      ...measuredRow(d),
      face: sectionCoordinates(d, "face"),
      corner: sectionCoordinates(d, "corner"),
    });
  }
  for (let mask = 0; mask < 16; mask++) {
    const r = reckon(p, mask);
    result.push({
      category: "reckoning",
      p,
      mask,
      input: exact(r.input),
      target: exact(r.target),
      choices: r.choices.map(exact),
      sourceMask: r.sourceMask,
      multiplier: exact(r.multiplier),
      total: exact(r.total),
      difference: exact(r.difference),
      matched: r.matched,
    });
  }
}
const lengths = [
  fraction(1, 100),
  fraction(1, 3),
  fraction(7, 4),
  fraction(8),
  fraction(12),
  fraction(280, 3),
  fraction(250),
  fraction(360),
  fraction(500),
];
for (const base of lengths)
  for (const height of lengths) {
    const d = { base, height };
    result.push({
      category: "experiment",
      ...measuredRow(d),
      face: sectionCoordinates(d, "face"),
      corner: sectionCoordinates(d, "corner"),
    });
  }
console.log(JSON.stringify(result));
