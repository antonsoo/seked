import { divide, exact, type Fraction, fraction, multiply, value } from "./fraction";
export interface Dimensions {
  base: Fraction;
  height: Fraction;
}
export function slope(dimensions: Dimensions) {
  const halfBase = divide(dimensions.base, fraction(2));
  const runPerCubit = divide(halfBase, dimensions.height);
  return {
    halfBase,
    runPerCubit,
    palms: multiply(runPerCubit, fraction(7)),
    fingers: multiply(runPerCubit, fraction(28)),
    risePerRun: divide(dimensions.height, halfBase),
  };
}
export type Section = "face" | "corner";
export function section(dimensions: Dimensions, kind: Section) {
  const half = value(dimensions.base) / 2;
  const run = kind === "face" ? half : half * Math.SQRT2;
  const height = value(dimensions.height);
  return {
    run,
    height,
    angle: (Math.atan2(height, run) * 180) / Math.PI,
    runPalms: (7 * run) / height,
  };
}
/** Shared equal-axis scale. The section is fitted without changing its angle. */
export function sectionCoordinates(dimensions: Dimensions, kind: Section) {
  const geometry = section(dimensions, kind);
  const scale = Math.min(390 / (2 * geometry.run), 245 / geometry.height);
  return {
    ...geometry,
    scale,
    apex: { x: 250, y: 305 - geometry.height * scale },
    center: { x: 250, y: 305 },
    left: { x: 250 - geometry.run * scale, y: 305 },
    right: { x: 250 + geometry.run * scale, y: 305 },
  };
}
export function measuredRow(dimensions: Dimensions) {
  const s = slope(dimensions);
  return {
    base: exact(dimensions.base),
    height: exact(dimensions.height),
    halfBase: exact(s.halfBase),
    runPerCubit: exact(s.runPerCubit),
    palms: exact(s.palms),
    fingers: exact(s.fingers),
    risePerRun: exact(s.risePerRun),
  };
}
