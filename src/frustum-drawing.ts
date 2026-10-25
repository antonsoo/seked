import { exact, fraction as f, mixed, value } from "./core/fraction";
import { type FrustumState, pieces, sliceAt, volumes } from "./core/frustum";

export const escapeHTML = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
const n = (v: number) => v.toFixed(3);
const title = (s: string) => `<title>${escapeHTML(s)}</title>`;

export function solidDrawing(s: FrustumState, id = "solid"): string {
  const meshes = pieces(s),
    v = volumes(s),
    a = value(s.base),
    h = value(s.height);
  const gap = (a * 0.38 * s.spread) / 100,
    yaw = (s.turn * Math.PI) / 180,
    elevation = 0.48;
  const project = ([x, y, z]: number[]) => ({
    x: Math.cos(yaw) * (x ?? 0) - Math.sin(yaw) * (y ?? 0),
    y:
      Math.sin(elevation) * (Math.sin(yaw) * (x ?? 0) + Math.cos(yaw) * (y ?? 0)) -
      Math.cos(elevation) * (z ?? 0),
    depth:
      Math.cos(elevation) * (Math.sin(yaw) * (x ?? 0) + Math.cos(yaw) * (y ?? 0)) +
      Math.sin(elevation) * (z ?? 0),
  });
  const transformed = meshes.map((p) => ({
    ...p,
    points: p.vertices.map((pv) =>
      project([
        value(pv[0]) + p.direction[0] * gap,
        value(pv[1]) + p.direction[1] * gap,
        value(pv[2]),
      ]),
    ),
  }));
  // Fit the complete possible translation and every allowed viewing angle once.
  // Re-fitting each pose would make unchanged pieces appear to shrink as they
  // separate. A prism has no nonzero translating pieces, so needs no gap reserve.
  const maximumGap = v.difference.n === 0n ? 0 : a * 0.38,
    baseReach = Math.SQRT2 * (a / 2 + maximumGap),
    topReach = Math.SQRT2 * (value(s.top) / 2 + maximumGap),
    minY = -Math.sin(elevation) * topReach - Math.cos(elevation) * h,
    maxY = Math.sin(elevation) * baseReach;
  const scale = Math.min(590 / (2 * baseReach), 380 / (maxY - minY));
  const point = (p: { x: number; y: number }) =>
    `${n(385 + p.x * scale)},${n(270 + (p.y - (minY + maxY) / 2) * scale)}`;
  const faces = transformed
    .flatMap((p) => {
      const physicalVolume = p.part === "core" ? v.core : p.part === "wedges" ? v.wedge : v.corner;
      if (physicalVolume.n === 0n) return [];
      return p.faces.map((face, index) => {
        const points = face.map((i) => p.points[i]).filter((p) => p !== undefined);
        return {
          depth: points.reduce((r, p) => r + p.depth, 0) / points.length,
          svg: `<polygon points="${points.map(point).join(" ")}" class="piece ${p.part} ${s.part !== "all" && s.part !== p.part ? "faded" : ""}" data-piece="${p.id}" data-face="${index}"/>`,
        };
      });
    })
    .sort((a, b) => a.depth - b.depth);
  const slice = sliceAt(s, s.cut),
    half = value(slice.side) / 2,
    z = value(slice.height);
  const plane =
    s.spread === 0
      ? `<polygon class="cut-plane" points="${[
          [-half, -half, z],
          [half, -half, z],
          [half, half, z],
          [-half, half, z],
        ]
          .map((p) => point(project(p)))
          .join(" ")}"/>`
      : "";
  // Dimension endpoints use the same projection as the mesh; no stretched axes.
  const endpoints = [
    [-a / 2, a / 2, 0],
    [a / 2, a / 2, 0],
    [a / 2, a / 2, h],
  ].map((p) => point(project(p)));
  const tiny = Math.min(a, h) / Math.max(a, h) < 0.04;
  const count =
    Number(v.core.n !== 0n) + 4 * Number(v.wedge.n !== 0n) + 4 * Number(v.corner.n !== 0n);
  const desiredUnit = 80 / scale,
    unitPower = 10 ** Math.floor(Math.log10(desiredUnit));
  const barUnit = ([1, 2, 5, 10].find((x) => x * unitPower >= desiredUnit) ?? 10) * unitPower;
  const barLength = barUnit * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 770 540" role="img" aria-labelledby="${id}-title" data-base="${exact(s.base)}" data-top="${exact(s.top)}" data-height="${exact(s.height)}" data-spread="${s.spread}" data-scale="${scale}">${title(`Square frustum, lower side ${mixed(s.base)}, upper side ${mixed(s.top)}, height ${mixed(s.height)}. ${count} nonzero pieces, ${s.spread ? "separated" : "assembled"}. Drawing scale stays fixed through separation and turning. Total volume ${mixed(v.total)} cubic units.`).replace("<title>", `<title id="${id}-title">`)}
  <text x="30" y="31" class="plate-label">${s.spread ? "THE SAME PIECES / TRANSLATED APART" : `${count} NONZERO PIECES / ASSEMBLED`}</text>
  <g class="mesh">${faces.map((f) => f.svg).join("")}</g>${plane}
  ${s.spread === 0 ? `<path class="solid-dimension" d="M${endpoints[0]}L${endpoints[1]}"/>` : ""}
  <text x="30" y="482">Lower side ${mixed(s.base)} · upper side ${mixed(s.top)} · height ${mixed(s.height)}</text>
  <text x="30" y="508" class="plate-label">${tiny ? "EXTREME PROPORTIONS: A THIN DIMENSION MAY BE SUBPIXEL" : "FIXED DRAWING SCALE / DEPTH FORESHORTENED"}</text>
  <path class="scale-bar" data-units="${barUnit}" d="M550 518h${n(barLength)}m0 -5v10M550 513v10"/>
  <text x="550" y="505" class="plate-label">${Number(barUnit.toPrecision(3))} units</text></svg>`;
}

export function sectionDrawing(s: FrustumState, id = "slice"): string {
  const cut = sliceAt(s, s.cut),
    a = value(s.base),
    b = value(s.top),
    side = value(cut.side),
    z = value(cut.height),
    h = value(s.height);
  const scale = Math.min(270 / a, 210 / h),
    x = 175,
    y = 270;
  const pt = (xv: number, zv: number) => `${n(x + xv * scale)},${n(y - zv * scale)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 355" role="img" aria-labelledby="${id}-title" data-slice-side="${exact(cut.side)}" data-slice-area="${exact(cut.area)}" data-slice-height="${exact(cut.height)}" data-scale="${scale}">
  <title id="${id}-title">Vertical section at equal scales; the horizontal cut has side ${mixed(cut.side)} at height ${mixed(cut.height)}.</title>
  <text x="20" y="28" class="plate-label">VERTICAL SECTION / SAME SCALE ON BOTH AXES</text>
  <path class="section-shape" d="M${pt(-a / 2, 0)}L${pt(a / 2, 0)}L${pt(b / 2, h)}L${pt(-b / 2, h)}Z"/>
  <path class="section-axis" d="M${pt(0, 0)}L${pt(0, h)}"/>
  <path class="section-cut" d="M${pt(-side / 2, z)}L${pt(side / 2, z)}" data-x1="${(-side / 2) * scale}" data-x2="${(side / 2) * scale}" data-z="${z * scale}"/>
  <text x="20" y="310">Cut height ${mixed(cut.height)} / ${mixed(s.height)}</text>
  <text x="20" y="337">Square side ${mixed(cut.side)} · area ${mixed(cut.area)}</text></svg>`;
}

export function productDrawing(
  s: Pick<FrustumState, "base" | "top" | "height">,
  id = "products",
): string {
  const a = value(s.base),
    b = value(s.top),
    v = volumes(s),
    scale = 125 / a;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 590 230" role="img" aria-labelledby="${id}-title"><title id="${id}-title">Three area products on one length scale: lower square ${mixed(v.lowerArea)}, side product ${mixed(v.productArea)}, upper square ${mixed(v.upperArea)}. They are separate products, not three slices of the solid.</title>
  <text x="20" y="23" class="plate-label">THREE PRODUCTS / ONE COMMON LENGTH SCALE</text>
  <rect class="area-lower" x="25" y="52" width="125" height="125"/>
  <rect class="area-product" x="225" y="${n(177 - b * scale)}" width="125" height="${n(b * scale)}"/>
  <rect class="area-upper" x="425" y="${n(177 - b * scale)}" width="${n(b * scale)}" height="${n(b * scale)}"/>
  <text x="175" y="126" class="plus">+</text><text x="375" y="126" class="plus">+</text>
  <text x="25" y="205">a² = ${mixed(v.lowerArea)}</text><text x="225" y="205">ab = ${mixed(v.productArea)}</text><text x="425" y="205">b² = ${mixed(v.upperArea)}</text></svg>`;
}

export function volumeTable(s: FrustumState): string {
  const v = volumes(s);
  return `<table class="volume-table"><caption>Volumes in cubic units</caption><thead><tr><th scope="col">Piece</th><th scope="col">One</th><th scope="col">Count</th><th scope="col">Together</th></tr></thead><tbody>
  <tr data-volume="core"><th scope="row">Central prism</th><td>${mixed(v.core)}</td><td>1</td><td>${mixed(v.core)}</td></tr>
  <tr data-volume="wedges"><th scope="row">Side wedge</th><td>${mixed(v.wedge)}</td><td>4</td><td>${mixed(v.wedges)}</td></tr>
  <tr data-volume="corners"><th scope="row">Corner pyramid</th><td>${mixed(v.corner)}</td><td>4</td><td>${mixed(v.corners)}</td></tr>
  </tbody><tfoot><tr><th scope="row" colspan="3">Total</th><td data-total="${exact(v.total)}">${mixed(v.total)}</td></tr></tfoot></table>`;
}

export function sourceNumbers(): string {
  const mark = (count: number, x: number) =>
    `${Array.from({ length: Math.floor(count / 10) }, (_, i) => `<path d="M${x + i * 17},40V23a6,6 0 0 1 12,0v17"/>`).join("")}${Array.from({ length: count % 10 }, (_, i) => `<path d="M${x + 102 + (i % 3) * 11},${17 + Math.floor(i / 3) * 18}v12"/>`).join("")}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 88" role="img" aria-label="Modern redrawing of the additive number signs: 16 as one ten and six units; 56 as five tens and six units."><g class="number-sign">${mark(16, 15)}${mark(56, 215)}</g><text x="15" y="78">16 = 10 + 6</text><text x="215" y="78">56 = 50 + 6</text></svg>`;
}

export const paperDimensions = () => ({ base: f(4), top: f(2), height: f(6) });
