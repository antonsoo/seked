import {
  add,
  divide,
  exact,
  type Fraction,
  fraction as f,
  multiply as mul,
  parseDimension,
  subtract as sub,
} from "./fraction";

export type Part = "all" | "core" | "wedges" | "corners";
export interface FrustumState {
  base: Fraction;
  top: Fraction;
  height: Fraction;
  spread: number;
  cut: number;
  turn: number;
  part: Part;
  step: number;
  source: number;
}
export const initialFrustum = (): FrustumState => ({
  base: f(4),
  top: f(2),
  height: f(6),
  spread: 0,
  cut: 50,
  turn: 35,
  part: "all",
  step: 0,
  source: 101,
});
export const square = (a: Fraction) => mul(a, a);
export const equals = (a: Fraction, b: Fraction) => a.n * b.d === b.n * a.d;
export function topDimension(raw: string): Fraction | null {
  return /^0(?:\.0{1,6}|\/\d{1,6})?$/.test(raw.trim()) && !/^0\/0+$/.test(raw.trim())
    ? f(0)
    : parseDimension(raw);
}
export function validDimensions(base: Fraction, top: Fraction, height: Fraction): boolean {
  return base.n > 0n && height.n > 0n && top.n >= 0n && sub(base, top).n >= 0n;
}
export function volumes(s: Pick<FrustumState, "base" | "top" | "height">) {
  const { base: a, top: b, height: h } = s;
  if (!validDimensions(a, b, h))
    throw new RangeError("Require 0 ≤ upper side ≤ lower side and a positive height.");
  const difference = sub(a, b);
  const lowerArea = square(a),
    upperArea = square(b),
    productArea = mul(a, b);
  const areaSum = add(add(lowerArea, productArea), upperArea);
  const core = mul(square(b), h);
  const wedge = divide(mul(mul(b, difference), h), f(4));
  const corner = divide(mul(square(difference), h), f(12));
  const total = divide(mul(h, areaSum), f(3));
  const endAverage = divide(mul(h, add(lowerArea, upperArea)), f(2));
  const middleSquare = mul(h, square(divide(add(a, b), f(2))));
  return {
    difference,
    lowerArea,
    upperArea,
    productArea,
    areaSum,
    core,
    wedge,
    corner,
    wedges: mul(wedge, f(4)),
    corners: mul(corner, f(4)),
    total,
    endAverage,
    middleSquare,
    endError: sub(endAverage, total),
    middleError: sub(total, middleSquare),
  };
}
export function sliceAt(s: Pick<FrustumState, "base" | "top" | "height">, percent: number) {
  const t = f(percent, 100);
  const side = add(s.base, mul(sub(s.top, s.base), t));
  return { height: mul(s.height, t), side, area: square(side) };
}

export type Vertex = readonly [Fraction, Fraction, Fraction];
export interface Piece {
  id: string;
  part: Exclude<Part, "all">;
  vertices: Vertex[];
  faces: number[][];
  direction: readonly [number, number];
}
/** A genuine nine-piece partition. The corner pyramids have an apex over one
 * corner of their base. They are not miniature centred copies of the frustum. */
export function pieces(s: Pick<FrustumState, "base" | "top" | "height">): Piece[] {
  volumes(s);
  const a = divide(s.base, f(2)),
    b = divide(s.top, f(2)),
    h = s.height,
    z = f(0);
  const neg = (x: Fraction) => mul(x, f(-1));
  const prismFaces = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [0, 1, 5, 4],
    [1, 2, 6, 5],
    [2, 3, 7, 6],
    [3, 0, 4, 7],
  ];
  const result: Piece[] = [
    {
      id: "central-prism",
      part: "core",
      direction: [0, 0],
      vertices: [
        [neg(b), neg(b), z],
        [b, neg(b), z],
        [b, b, z],
        [neg(b), b, z],
        [neg(b), neg(b), h],
        [b, neg(b), h],
        [b, b, h],
        [neg(b), b, h],
      ],
      faces: prismFaces,
    },
  ];
  for (let i = 0; i < 4; i++) {
    const rotate = (v: Vertex): Vertex => {
      let [x, y] = v;
      for (let k = 0; k < i; k++) [x, y] = [neg(y), x];
      return [x, y, v[2]];
    };
    const direction = [
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 0],
    ][i] as [number, number];
    result.push({
      id: `wedge-${i + 1}`,
      part: "wedges",
      direction,
      vertices: (
        [
          [neg(b), b, z],
          [b, b, z],
          [b, a, z],
          [neg(b), a, z],
          [neg(b), b, h],
          [b, b, h],
        ] as Vertex[]
      ).map(rotate),
      faces: [
        [0, 1, 2, 3],
        [0, 1, 5, 4],
        [1, 2, 5],
        [2, 3, 4, 5],
        [3, 0, 4],
      ],
    });
    result.push({
      id: `corner-${i + 1}`,
      part: "corners",
      direction: [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1],
      ][i] as [number, number],
      vertices: (
        [
          [b, b, z],
          [a, b, z],
          [a, a, z],
          [b, a, z],
          [b, b, h],
        ] as Vertex[]
      ).map(rotate),
      faces: [
        [0, 1, 2, 3],
        [0, 1, 4],
        [1, 2, 4],
        [2, 3, 4],
        [3, 0, 4],
      ],
    });
  }
  return result;
}

const params = ["a", "b", "h", "spread", "cut", "turn", "part", "step", "source"];
const partNames: Part[] = ["all", "core", "wedges", "corners"];
export function frustumQuery(s: FrustumState): string {
  return `?${new URLSearchParams({
    a: exact(s.base),
    b: exact(s.top),
    h: exact(s.height),
    spread: String(s.spread),
    cut: String(s.cut),
    turn: String(s.turn),
    part: s.part,
    step: String(s.step),
    source: String(s.source),
  })}`;
}
export function parseFrustumQuery(search: string): { state: FrustumState; warning: string } {
  const state = initialFrustum(),
    p = new URLSearchParams(search);
  const fallback = () => ({
    state: initialFrustum(),
    warning: "The link contains invalid or repeated settings. The papyrus example is shown.",
  });
  for (const name of params) if (p.getAll(name).length > 1) return fallback();
  for (const [key, param] of [
    ["base", "a"],
    ["top", "b"],
    ["height", "h"],
  ] as const) {
    if (!p.has(param)) continue;
    const v = key === "top" ? topDimension(p.get(param) ?? "") : parseDimension(p.get(param) ?? "");
    if (!v) return fallback();
    state[key] = v;
  }
  if (!validDimensions(state.base, state.top, state.height)) return fallback();
  for (const [key, min, max] of [
    ["spread", 0, 100],
    ["cut", 0, 100],
    ["turn", 10, 80],
    ["step", 0, 5],
    ["source", 100, 102],
  ] as const) {
    if (!p.has(key)) continue;
    const raw = p.get(key) ?? "",
      n = Number(raw);
    if (!/^\d{1,3}$/.test(raw) || n < min || n > max) return fallback();
    state[key] = n;
  }
  if (p.has("part")) {
    const name = p.get("part") as Part;
    if (!partNames.includes(name)) return fallback();
    state.part = name;
  }
  return { state, warning: "" };
}
export function frustumJSON(s: FrustumState): string {
  return `${JSON.stringify(
    {
      format: "seked-frustum",
      version: 1,
      dimensions: { lowerSide: exact(s.base), upperSide: exact(s.top), height: exact(s.height) },
      view: {
        spread: s.spread,
        cut: s.cut,
        turn: s.turn,
        part: s.part,
        step: s.step,
        source: s.source,
      },
    },
    null,
    2,
  )}\n`;
}
/** Validate a whole document; do not silently replace malformed imported data. */
export function readFrustumJSON(text: string): FrustumState {
  if (text.length > 16000) throw new Error("The drawing file is too large (16 KB maximum).");
  const j = JSON.parse(text);
  const keys = (o: unknown, allowed: string[]) =>
    o !== null &&
    typeof o === "object" &&
    !Array.isArray(o) &&
    Object.keys(o).length === allowed.length &&
    Object.keys(o).every((k) => allowed.includes(k));
  if (
    !keys(j, ["format", "version", "dimensions", "view"]) ||
    j.format !== "seked-frustum" ||
    j.version !== 1 ||
    !keys(j.dimensions, ["lowerSide", "upperSide", "height"]) ||
    !keys(j.view, ["spread", "cut", "turn", "part", "step", "source"])
  )
    throw new Error("Choose a Seked frustum drawing in format version 1.");
  if (
    ![j.dimensions.lowerSide, j.dimensions.upperSide, j.dimensions.height].every(
      (v) => typeof v === "string",
    ) ||
    ![j.view.spread, j.view.cut, j.view.turn, j.view.step, j.view.source].every(Number.isInteger) ||
    typeof j.view.part !== "string"
  )
    throw new Error("The drawing contains invalid dimensions or view settings.");
  const p = new URLSearchParams({
    a: j.dimensions.lowerSide,
    b: j.dimensions.upperSide,
    h: j.dimensions.height,
    ...j.view,
  });
  const result = parseFrustumQuery(p.toString());
  if (result.warning)
    throw new Error("The drawing contains out-of-range or inconsistent settings.");
  return result.state;
}
