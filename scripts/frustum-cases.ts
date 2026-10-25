import { exact, fraction as f } from "../src/core/fraction";
import { initialFrustum, pieces, sliceAt, volumes } from "../src/core/frustum";

let cases = 0;
function emit(a: ReturnType<typeof f>, b: ReturnType<typeof f>, h: ReturnType<typeof f>) {
  const s = { ...initialFrustum(), base: a, top: b, height: h };
  const v = volumes(s);
  console.log(
    JSON.stringify({
      dimensions: [a, b, h].map(exact),
      volumes: Object.fromEntries(Object.entries(v).map(([k, v]) => [k, exact(v)])),
      cuts: [0, 1, 25, 50, 77, 99, 100].map((p) => ({
        percent: p,
        ...Object.fromEntries(Object.entries(sliceAt(s, p)).map(([k, v]) => [k, exact(v)])),
      })),
      pieces: pieces(s).map((p) => ({
        id: p.id,
        part: p.part,
        vertices: p.vertices.map((v) => v.map(exact)),
        faces: p.faces,
      })),
    }),
  );
  cases++;
}
for (let a = 1; a <= 9; a++)
  for (let top = 0; top <= 4; top++)
    for (const height of [f(1, 3), f(1), f(6), f(57, 4)]) emit(f(a), f(a * top, 4), height);
for (let i = 1; i <= 83; i++) emit(f(i + 4, 7), f(i, 13), f(i + 1, 9));
emit(f(1, 100), f(0), f(500));
emit(f(500), f(499999, 1000), f(1, 100));
emit(f(4), f(2), f(6));
emit(f(4), f(3), f(6));
process.stderr.write(`Emitted ${cases} exact solid and mesh cases.\n`);
