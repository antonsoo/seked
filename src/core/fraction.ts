/** Exact, normalized arithmetic; display geometry is converted to floating point only at the SVG boundary. */
export type Fraction = Readonly<{ n: bigint; d: bigint }>;
function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}
export function fraction(n: bigint | number, d: bigint | number = 1): Fraction {
  let numerator = BigInt(n),
    denominator = BigInt(d);
  if (!denominator) throw new RangeError("A denominator cannot be zero.");
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const g = gcd(numerator, denominator);
  return { n: numerator / g, d: denominator / g };
}
export const add = (a: Fraction, b: Fraction) => fraction(a.n * b.d + b.n * a.d, a.d * b.d);
export const subtract = (a: Fraction, b: Fraction) => fraction(a.n * b.d - b.n * a.d, a.d * b.d);
export const multiply = (a: Fraction, b: Fraction) => fraction(a.n * b.n, a.d * b.d);
export const divide = (a: Fraction, b: Fraction) => fraction(a.n * b.d, a.d * b.n);
export const value = (a: Fraction) => Number(a.n) / Number(a.d);
export const exact = (a: Fraction) => (a.d === 1n ? String(a.n) : `${a.n}/${a.d}`);
export function mixed(a: Fraction): string {
  if (a.d === 1n) return String(a.n);
  const whole = a.n / a.d,
    remainder = a.n % a.d;
  return whole === 0n ? exact(a) : `${whole} ${remainder < 0n ? -remainder : remainder}/${a.d}`;
}
/** Positive dimension input, bounded before BigInt conversion. No expressions or exponent notation. */
export function parseDimension(raw: string): Fraction | null {
  const text = raw.trim();
  if (
    text.length > 24 ||
    !/^(?:\d{1,6}(?:\.\d{1,6})?|\d{1,6}\/\d{1,6}|\d{1,6} \d{1,6}\/\d{1,6})$/.test(text)
  )
    return null;
  let result: Fraction;
  if (text.includes("/")) {
    const [left, denominator] = text.split("/");
    if (BigInt(denominator ?? "0") === 0n) return null;
    const parts = left?.split(" ") ?? [];
    result =
      parts.length === 2
        ? add(
            fraction(BigInt(parts[0] ?? "0")),
            fraction(BigInt(parts[1] ?? "0"), BigInt(denominator ?? "1")),
          )
        : fraction(BigInt(left ?? "0"), BigInt(denominator ?? "1"));
  } else if (text.includes(".")) {
    const [whole, decimal] = text.split(".");
    result = fraction(
      BigInt((whole ?? "0") + (decimal ?? "")),
      10n ** BigInt(decimal?.length ?? 0),
    );
  } else result = fraction(BigInt(text));
  return result.n > 0n && result.n * 100n >= result.d && result.n <= 500n * result.d
    ? result
    : null;
}
