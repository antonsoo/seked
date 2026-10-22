import { dimensionsFor, getProblem, type ProblemId, problemIds, type Reading } from "../content";
import { exact, fraction, parseDimension } from "./fraction";
import type { Dimensions, Section } from "./geometry";
export interface State {
  problem: ProblemId;
  step: number;
  reading: Reading;
  lab: Dimensions;
  section: Section;
}
export function initial(): State {
  return {
    problem: "56",
    step: 0,
    reading: "written",
    lab: { base: fraction(12), height: fraction(8) },
    section: "face",
  };
}
export function readState(search: string): State {
  const p = new URLSearchParams(search),
    state = initial();
  const id = p.get("p");
  if (problemIds.includes(id as ProblemId)) state.problem = id as ProblemId;
  const step = p.get("step");
  if (step !== null && /^[0-4]$/.test(step)) state.step = Number(step);
  if (p.get("reading") === "working") state.reading = "working";
  const base = parseDimension(p.get("base") ?? ""),
    height = parseDimension(p.get("height") ?? "");
  if (base && height) state.lab = { base, height };
  if (p.get("section") === "corner") state.section = "corner";
  return state;
}
export function writeState(state: State): string {
  return `?p=${state.problem}&step=${state.step}&reading=${state.reading}&base=${encodeURIComponent(exact(state.lab.base))}&height=${encodeURIComponent(exact(state.lab.height))}&section=${state.section}`;
}
export function lessonDimensions(state: State): Dimensions {
  return dimensionsFor(state.problem, state.reading);
}
export function selectedStep(state: State) {
  const step = getProblem(state.problem).steps[state.step];
  if (!step) throw new Error("Unknown reading step.");
  return step;
}
