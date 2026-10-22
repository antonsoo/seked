import { fraction } from "./core/fraction";
import type { Dimensions } from "./core/geometry";
export type ProblemId = "56" | "57" | "58" | "59" | "59B" | "60";
export type Reading = "written" | "working";
export interface Step {
  title: string;
  text: string;
  equation: string;
  emphasis: "base" | "half" | "height" | "ratio" | "palms" | "conflict";
}
export interface Problem {
  id: ProblemId;
  title: string;
  question: string;
  dimensions: Dimensions;
  steps: Step[];
  literal: number;
  plate: number;
  register: number;
  observation: string;
}
export const problems: Problem[] = [
  {
    id: "56",
    title: "From a large pyramid to one cubit",
    question: "The side of the base is 360 and the vertical height is 250. Find the seked.",
    dimensions: { base: fraction(360), height: fraction(250) },
    literal: 203,
    plate: 204,
    register: 1,
    observation:
      "The initial dimensions have no written unit in the literal text. The conversion explicitly introduces a seven-palm cubit. We use cubits consistently in the drawing; the ratio does not depend on the chosen common length unit.",
    steps: [
      {
        title: "Read the two dimensions",
        text: "The side belongs to the square base. The height runs vertically from its center to the apex. The section through the middle of a face uses only half of the base side.",
        equation: "base side = 360; height = 250",
        emphasis: "base",
      },
      {
        title: "Take half of the base",
        text: "The worked text first halves 360. This gives the horizontal run from the foot of the face to the center below the apex.",
        equation: "360 × 1/2 = 180",
        emphasis: "half",
      },
      {
        title: "Find how much of 250 makes 180",
        text: "The source expresses the answer as a sum: one half, one fifth and one fiftieth. Their sum is 18/25. The same shape can be made with one cubit vertically and 18/25 of a cubit horizontally.",
        equation: "180/250 = 1/2 + 1/5 + 1/50 = 18/25",
        emphasis: "ratio",
      },
      {
        title: "Count the run in palms",
        text: "A cubit here contains seven palms. Multiply the horizontal fraction by seven. This is a horizontal length for every one cubit of vertical rise.",
        equation: "7 × (1/2 + 1/5 + 1/50) = 5 + 1/25 palms",
        emphasis: "palms",
      },
      {
        title: "Check the small triangle against the large one",
        text: "The run is 5.04 palms while the rise is seven palms. A smaller seked would give a steeper face. The decimal and degree labels in this workshop are modern comparisons.",
        equation: "5.04/7 = 180/250",
        emphasis: "ratio",
      },
    ],
  },
  {
    id: "57",
    title: "Recover the missing height",
    question:
      "The base side is 140. The seked is five palms and one finger. Find the vertical height.",
    dimensions: { base: fraction(140), height: fraction(280, 3) },
    literal: 205,
    plate: 206,
    register: 2,
    observation:
      "One finger is a quarter of a palm. The text doubles the seked and works with the whole base, rather than halving the base first. The two procedures agree exactly.",
    steps: [
      {
        title: "Read a slope as a length",
        text: "Five palms and one finger are 5 1/4 palms of horizontal run for a seven-palm vertical cubit.",
        equation: "5 palms + 1 finger = 21/4 palms",
        emphasis: "palms",
      },
      {
        title: "Double the seked",
        text: "The worked text keeps the whole base side, 140. It therefore doubles the horizontal measure attached to one cubit of rise.",
        equation: "2 × 21/4 = 21/2 = 10 1/2",
        emphasis: "base",
      },
      {
        title: "Find the multiplier that makes seven",
        text: "Two thirds of 10 1/2 is seven. This multiplier converts the full base side into the vertical height.",
        equation: "(2/3) × (21/2) = 7",
        emphasis: "ratio",
      },
      {
        title: "Use the same multiplier on 140",
        text: "The result is exactly 93 1/3. A check using half the base gives the same original seked.",
        equation: "140 × 2/3 = 280/3 = 93 1/3",
        emphasis: "height",
      },
      {
        title: "Reverse the calculation",
        text: "Half of 140 is 70. Dividing 70 by 93 1/3 gives 3/4 of a cubit horizontally; seven times that is 5 1/4 palms. The next problem performs this reverse operation.",
        equation: "7 × 70 ÷ (280/3) = 21/4",
        emphasis: "palms",
      },
    ],
  },
  {
    id: "58",
    title: "Turn the preceding problem around",
    question: "The vertical height is 93 1/3 and the base side is 140. Find the seked.",
    dimensions: { base: fraction(140), height: fraction(280, 3) },
    literal: 207,
    plate: 208,
    register: 3,
    observation:
      "The half and quarter rows are not approximations. They add exactly to 70. This exercise reverses problem 57 with the same dimensions.",
    steps: [
      {
        title: "Start with the completed height",
        text: "The preceding answer becomes this problem’s input. The height is the mixed number 93 1/3.",
        equation: "height = 280/3; base side = 140",
        emphasis: "height",
      },
      {
        title: "Halve the base side",
        text: "The face section runs from the midpoint of a base side to the center, a distance of 70.",
        equation: "140 × 1/2 = 70",
        emphasis: "half",
      },
      {
        title: "Add the half and quarter rows",
        text: "Half of 93 1/3 is 46 2/3. A quarter is 23 1/3. Together they make 70, so the required fraction of a cubit is one half plus one quarter.",
        equation: "46 2/3 + 23 1/3 = 70",
        emphasis: "ratio",
      },
      {
        title: "Convert into palms and a finger",
        text: "Half of seven is 3 1/2. A quarter is 1 1/2 + 1/4. Their sum is five palms and one finger.",
        equation: "7 × (1/2 + 1/4) = 5 1/4 palms",
        emphasis: "palms",
      },
      {
        title: "Recognize a shared shape",
        text: "These dimensions give the same shape as a base of 12 and a height of 8. Scaling a triangle changes its size without changing the seked.",
        equation: "70/(280/3) = 6/8 = 3/4",
        emphasis: "ratio",
      },
    ],
  },
  {
    id: "59",
    title: "When the statement and working disagree",
    question:
      "The literal edition states height 12 and base side 8, then works with 8 to make 6. Read both sets of dimensions.",
    dimensions: { base: fraction(12), height: fraction(8) },
    literal: 209,
    plate: 210,
    register: 4,
    observation:
      "Chace’s literal edition retains a result of five palms and two fingers and marks “2” as a mistake for “1.” Peet’s translation prints the corrected one finger. Neither result agrees with height 12 and base side 8 as written.",
    steps: [
      {
        title: "Keep the written statement visible",
        text: "Height 12 and base side 8 give a half-base of 4. That triangle has a seked of 2 1/3 palms. Use the reading switch to compare it with the dimensions implied by the working.",
        equation: "as written: 7 × 4/12 = 7/3 palms",
        emphasis: "conflict",
      },
      {
        title: "Read what the arithmetic actually does",
        text: "The working asks for the fraction of 8 that makes 6. A half and a quarter do that. This matches a height of 8 and a base side of 12, reversing the stated dimensions.",
        equation: "8 × (1/2 + 1/4) = 6",
        emphasis: "half",
      },
      {
        title: "Convert the worked fraction",
        text: "Multiplying three quarters by seven gives 5 1/4 palms: five palms and one finger. The unit-fraction rows support this number.",
        equation: "7 × (1/2 + 1/4) = 21/4 palms",
        emphasis: "palms",
      },
      {
        title: "Notice the second discrepancy",
        text: "The literal edition prints five palms and two fingers, or 5 1/2 palms, and proposes one finger in a footnote. The working’s 5 1/4 and the printed result’s 5 1/2 stay separate here.",
        equation: "worked: 21/4; printed result: 11/2 palms",
        emphasis: "conflict",
      },
      {
        title: "Compare the editions, not just the answers",
        text: "Peet prints the corrected five palms and one finger. Chace’s literal translation preserves two and footnotes the correction. The disagreement is visible in the included printed pages.",
        equation: "statement ≠ working ≠ literal result",
        emphasis: "conflict",
      },
    ],
  },
  {
    id: "59B",
    title: "An inverse calculation with a wrong final number",
    question: "A pyramid “of 12” has a seked of five palms and one finger. Find its height.",
    dimensions: { base: fraction(12), height: fraction(8) },
    literal: 209,
    plate: 210,
    register: 4,
    observation:
      "The base-side term is absent after “12.” Both editions interpret it as the base side. The literal text then says two thirds of 12 is 4; the editors correct this to 8. The number 59B is an editorial subdivision.",
    steps: [
      {
        title: "Read the supplied quantities",
        text: "The same inverse method as problem 57 is used. The phrase “a pyramid of 12” leaves the dimension’s name unstated; the editors take it to be the base side.",
        equation: "base side interpreted as 12; seked = 21/4 palms",
        emphasis: "base",
      },
      {
        title: "Double the horizontal measure",
        text: "Using the entire side requires twice the seked. Two thirds of this doubled amount makes one cubit, seven palms.",
        equation: "(21/4) × 2 = 21/2; (21/2) × 2/3 = 7",
        emphasis: "ratio",
      },
      {
        title: "Apply two thirds to twelve",
        text: "The arithmetic gives eight. This height reproduces the supplied seked and the working dimensions of problem 59.",
        equation: "12 × 2/3 = 8",
        emphasis: "height",
      },
      {
        title: "Read the written four beside the calculated eight",
        text: "Both editions report a written final 4 and propose 8. A height of 4 with the same base would have a seked of 10 1/2 palms, twice the one supplied.",
        equation: "written: 4; calculated: 8",
        emphasis: "conflict",
      },
      {
        title: "Verify by substitution",
        text: "The calculated height of eight makes the half-base six equal three quarters of the height. The problem’s five palms and one finger follow.",
        equation: "7 × (12/2)/8 = 21/4 palms",
        emphasis: "palms",
      },
    ],
  },
  {
    id: "60",
    title: "A reciprocal, and an uncertain solid",
    question:
      "A structure called iwn has a base measure of 15 cubits and a height of 30. Find its seked.",
    dimensions: { base: fraction(15), height: fraction(30) },
    literal: 211,
    plate: 212,
    register: 5,
    observation:
      "The word and simple triangular figure do not identify the solid securely. The editions consider a pillar or cone; Peet also discusses a pyramid or prism. The app draws only the measured section. The final written 4 is retained, not silently replaced by 1/4.",
    steps: [
      {
        title: "Read the two measurements",
        text: "The base measure is 15 and the vertical height is 30. We can inspect their section without deciding which three-dimensional solid was intended.",
        equation: "base measure = 15; height = 30",
        emphasis: "base",
      },
      {
        title: "Take half of fifteen",
        text: "The working begins like the earlier slope problems: halve the base measure.",
        equation: "15 × 1/2 = 15/2 = 7 1/2",
        emphasis: "half",
      },
      {
        title: "Follow the written operation",
        text: "The text multiplies 7 1/2 by four to obtain 30 and calls four the seked. This computes rise divided by run.",
        equation: "30 ÷ (15/2) = 4",
        emphasis: "conflict",
      },
      {
        title: "Compare the opposite direction",
        text: "The earlier problems use horizontal run per vertical rise. Here that would be 7 1/2 divided by 30: one quarter of a cubit, or 1 3/4 palms. This is the editors’ corrected direction.",
        equation: "(15/2) ÷ 30 = 1/4; 7 × 1/4 = 7/4 palms",
        emphasis: "ratio",
      },
      {
        title: "Keep the evidence and correction together",
        text: "The written result is four; the analogous run-per-rise calculation gives one quarter. The source does not perform the final conversion to palms. Our 1 3/4-palms label is explicitly calculated.",
        equation: "rise/run = 4; run/rise = 1/4",
        emphasis: "conflict",
      },
    ],
  },
];
export const problemIds = problems.map((p) => p.id);
export function getProblem(id: ProblemId): Problem {
  const problem = problems.find((p) => p.id === id);
  if (!problem) throw new Error("Unknown problem.");
  return problem;
}
export function dimensionsFor(id: ProblemId, reading: Reading): Dimensions {
  return id === "59" && reading === "written"
    ? { base: fraction(8), height: fraction(12) }
    : getProblem(id).dimensions;
}
export const words = [
  {
    word: "mr",
    gloss: "pyramid",
    note: "The noun names the subject of problems 56–59B. The source drawing includes a low base line; the geometry in this app is a modern section.",
    problem: "56",
    page: 203,
  },
  {
    word: "mḥ",
    gloss: "cubit",
    note: "The arm measure appears when the calculation reduces the large triangle to a one-cubit rise. These exercises explicitly use a cubit of seven palms.",
    problem: "56",
    page: 203,
  },
  {
    word: "šsp",
    gloss: "palm",
    note: "Seven palms make the cubit used here. One finger is a quarter of a palm. The horizontal result can therefore be stated in palms and fingers.",
    problem: "57",
    page: 205,
  },
  {
    word: "iwn",
    gloss: "pillar; a structure of uncertain form here",
    note: "The word replaces “pyramid” in problem 60. A vocabulary gloss alone does not establish whether this particular figure is a cone, pyramid or another solid.",
    problem: "60",
    page: 211,
  },
] as const;
export const archiveId =
  "arnoldbuffumchaceludlowbullhenryparkermanningtherhindmathematicalpapyrus.volumei";
export function sourceURL(page: number): string {
  return `https://archive.org/details/${archiveId}/page/n${page - 1}/mode/1up`;
}
export function sourceLabel(page: number): string {
  if (page === 36) return "Photograph XXI · whole papyrus portion";
  if (page === 37) return "Photograph XXII · adjoining papyrus portion";
  const p = problems.find((p) => p.literal === page || p.plate === page);
  return p
    ? `Problem ${p.id === "59" ? "59 & 59B" : p.id} · ${p.literal === page ? "literal translation" : `transcription, plate ${78 + (page - 204) / 2}`}`
    : "Printed evidence";
}

/** Positions are reading guides within the complete edition scans, not measurements of the papyrus. */
export function sourceFocus(page: number | "peet", id: ProblemId): { x: number; y: number } {
  if (page === "peet") return { x: 0.5, y: 0.4 };
  if (page === 36 || page === 37) {
    if (id === "59B" && page === 37) return { x: 0.43, y: 0.56 };
    const y = [0.17, 0.27, 0.39, 0.52, 0.65][getProblem(id).register - 1] ?? 0.43;
    return { x: page === 36 ? 0.35 : 0.77, y };
  }
  return { x: 0.5, y: 0.43 };
}
export function sourceCaption(page: number | "peet", id: ProblemId): string {
  if (page === "peet")
    return "Peet (1923), p. 100, from the 1970 facsimile reprint: compare the printed corrections in problems 59 and 59B.";
  if (page === 36 || page === 37) {
    const place =
      id === "59B"
        ? "Problem 59B is written separately in the left portion of photograph XXII. Photograph XXI supplies the adjoining exercises."
        : `Problem ${id} occupies register ${getProblem(id).register}, counted from the top: its beginning is at the left of photograph XXI, and its continuation at the right of XXII. The photographs overlap.`;
    return `${sourceLabel(page)}. ${place} The printed problem numbers were added by editors.`;
  }
  return `${sourceLabel(page)}. ${
    page % 2 === 0
      ? "Copied hieratic above, hieroglyphic transcription below. The edition’s transliteration runs right to left, with letters and digits reversed. Compare the facing literal translation for left-to-right reading."
      : "A dot above the first digit denotes a unit fraction in this edition; a double dot above 3 denotes two thirds. The notes explain proposed corrections."
  }`;
}
