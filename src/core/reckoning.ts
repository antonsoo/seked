import type { ProblemId } from "../content";
import { add, type Fraction, fraction, multiply, subtract } from "./fraction";
export function reckoning(id: ProblemId): {
  input: Fraction;
  target: Fraction;
  choices: Fraction[];
  sourceMask: number;
  note: string;
} {
  if (id === "56")
    return {
      input: fraction(250),
      target: fraction(180),
      choices: [fraction(1, 2), fraction(1, 4), fraction(1, 5), fraction(1, 50)],
      sourceMask: 13,
      note: "The printed decomposition is 1/2 + 1/5 + 1/50. The quarter row is an extra modern comparison.",
    };
  if (id === "57" || id === "59B")
    return {
      input: fraction(21, 2),
      target: fraction(7),
      choices: [fraction(1, 2), fraction(1, 3), fraction(2, 3), fraction(1, 4)],
      sourceMask: 4,
      note: "The text selects two thirds of the doubled seked, 10 1/2, to obtain seven. The other choices are modern comparisons.",
    };
  if (id === "60")
    return {
      input: fraction(15, 2),
      target: fraction(30),
      choices: [fraction(1), fraction(2), fraction(4)],
      sourceMask: 4,
      note: "These doubling rows follow the written operation. Four is its multiplier: vertical rise divided by horizontal run. Obtaining this target does not make four a run-per-rise seked.",
    };
  return {
    input: id === "58" ? fraction(280, 3) : fraction(8),
    target: id === "58" ? fraction(70) : fraction(6),
    choices: [fraction(1, 2), fraction(1, 4), fraction(1, 3), fraction(2, 3)],
    sourceMask: 3,
    note:
      id === "59"
        ? "This table follows the arithmetic’s 8 and 6, even when the drawing is set to the written statement. Half plus quarter makes three quarters. The third and two-thirds rows are modern comparisons."
        : "The source selects half plus quarter. The third and two-thirds rows are extra modern comparisons.",
  };
}
export function reckon(id: ProblemId, mask: number) {
  const r = reckoning(id);
  const selected = r.choices.filter((_, i) => Boolean(mask & (1 << i)));
  const multiplier = selected.reduce(add, fraction(0));
  const total = multiply(r.input, multiplier);
  return {
    ...r,
    selected,
    multiplier,
    total,
    difference: subtract(r.target, total),
    matched: total.n * r.target.d === r.target.n * total.d,
  };
}
