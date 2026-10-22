import type { Step } from "./content";
import { exact, mixed, value } from "./core/fraction";
import { type Dimensions, type Section, section, sectionCoordinates, slope } from "./core/geometry";

const line = (x1: number, y1: number, x2: number, y2: number, cls = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
const text = (x: number, y: number, label: string, cls = "", anchor = "middle") =>
  `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${label}</text>`;
const number = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 3 });
export function sectionDrawing(
  dim: Dimensions,
  kind: Section = "face",
  emphasis: Step["emphasis"] = "ratio",
  id = "section",
  customHeading?: string,
): string {
  const g = sectionCoordinates(dim, kind),
    s = slope(dim),
    run = kind === "face" ? mixed(s.halfBase) : number(g.run);
  const { left: l, right: r, apex: a, center: c } = g;
  return `<svg class="section-svg" viewBox="0 0 500 380" role="img" aria-labelledby="${id}-title ${id}-desc" data-kind="${kind}" data-scale="${g.scale}"><title id="${id}-title">${kind === "face" ? "Face section" : "Corner section"}: base ${mixed(dim.base)}, height ${mixed(dim.height)}</title><desc id="${id}-desc">Equal scales on both axes. Horizontal half-section ${run}; vertical height ${mixed(dim.height)}. The slope makes ${number(g.angle)} degrees to the horizontal, a modern angular comparison.</desc>
 <path d="M${l.x} ${l.y}L${a.x} ${a.y}L${r.x} ${r.y}Z" class="outline"/>
 <path d="M${a.x} ${a.y}L${c.x} ${c.y}L${r.x} ${r.y}Z" class="half-shape"/>
 ${line(a.x, a.y, c.x, c.y, `height ${emphasis === "height" ? "emphasized" : ""}`)}
 ${line(c.x, c.y, r.x, r.y, `run ${["half", "ratio", "palms"].includes(emphasis) ? "emphasized" : ""}`)}
 <path d="M250 291h14v14" class="right-angle"/>
 ${line(l.x, 335, r.x, 335, emphasis === "base" ? "emphasized base-rule" : "base-rule")}
 ${line(l.x, 330, l.x, 340, "base-rule")}${line(r.x, 330, r.x, 340, "base-rule")}
 ${text(250, 360, kind === "face" ? `${mixed(dim.base)} · base side` : `${number(2 * g.run)} · base diagonal`, "dimension")}
 ${text(250, (a.y + c.y) / 2 - 4, `${mixed(dim.height)} height`, "height-label", "end")}
 ${text((c.x + r.x) / 2, 294, `${run} run`, "run-label")}
 ${text(250, 30, customHeading ?? (kind === "face" ? "THROUGH THE MIDDLE OF A FACE" : "THROUGH OPPOSITE CORNERS"), "plate-label")}
 <circle data-point="apex" cx="${a.x}" cy="${a.y}" r="3"/><circle data-point="center" cx="250" cy="305" r="3"/><circle data-point="foot" cx="${r.x}" cy="305" r="3"/>
 </svg>`;
}
export function unitDrawing(dim: Dimensions, kind: Section = "face", id = "unit"): string {
  const g = section(dim, kind),
    x = 94,
    y = 260,
    scale = Math.min(26, 255 / g.runPalms),
    rise = 7 * scale,
    run = g.runPalms * scale;
  const label =
    kind === "face" ? `${mixed(slope(dim).palms)} palms` : `${number(g.runPalms)} palms`;
  const ticks = Array.from({ length: 8 }, (_, i) =>
    line(x - 5, y - i * scale, x + 5, y - i * scale, "unit-tick"),
  ).join("");
  return `<svg class="unit-svg" viewBox="0 0 400 320" role="img" aria-labelledby="${id}-title"><title id="${id}-title">The same slope at one vertical cubit: seven palms up, ${label} inward.</title><path d="M${x} ${y - rise}V${y}H${x + run}Z" class="half-shape"/>${line(x, y - rise, x, y, "height emphasized")}${line(x, y, x + run, y, "run emphasized")}${line(x, y - rise, x + run, y, "outline")}${ticks}${text(x - 14, y - rise / 2, "7 palms", "height-label", "end")}${text(x - 14, y - rise / 2 + 20, "1 cubit", "height-label", "end")}${text(x + run / 2, y + 29, label, "run-label")}${text(200, 28, "THE SAME SHAPE, ONE CUBIT HIGH", "plate-label")}<circle data-point="unit-top" cx="${x}" cy="${y - rise}" r="3"/><circle data-point="unit-foot" cx="${x + run}" cy="${y}" r="3"/></svg>`;
}
export function planDrawing(kind: Section): string {
  const corner = kind === "corner";
  return `<svg class="plan-svg" viewBox="0 0 280 240" role="img" aria-labelledby="plan-title"><title id="plan-title">Square base seen from above. ${corner ? "The section joins opposite corners." : "The section joins the midpoints of opposite sides."}</title><path d="M60 40h160v160H60Z" class="outline"/><path d="M60 40L220 200M220 40L60 200" class="construction"/>${line(corner ? 60 : 140, 40, corner ? 220 : 140, 200, "run emphasized")}<circle cx="140" cy="120" r="4"/>${text(140, 226, "PLAN · APEX ABOVE CENTER", "plate-label")}</svg>`;
}
export function exactTable(dim: Dimensions): string {
  const s = slope(dim);
  return `<table><thead><tr><th>Quantity</th><th>Exact value</th></tr></thead><tbody><tr><th>Base side</th><td>${exact(dim.base)}</td></tr><tr><th>Vertical height</th><td>${exact(dim.height)}</td></tr><tr><th>Half-base</th><td>${exact(s.halfBase)}</td></tr><tr><th>Horizontal cubits per vertical cubit</th><td>${exact(s.runPerCubit)}</td></tr><tr><th>Palms per vertical cubit</th><td>${exact(s.palms)}</td></tr><tr><th>Fingers per vertical cubit</th><td>${exact(s.fingers)}</td></tr></tbody></table>`;
}
export function degreeLabel(dim: Dimensions, kind: Section): string {
  return `${number(section(dim, kind).angle)}°`;
}
export function dimensionsLabel(dim: Dimensions): string {
  return `${mixed(dim.base)} base × ${mixed(dim.height)} height`;
}
export const decimalPalms = (dim: Dimensions) => number(value(slope(dim).palms));
