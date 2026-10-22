import { getProblem, sourceLabel, sourceURL, words } from "./content";
import { exact, mixed } from "./core/fraction";
import { measuredRow, slope } from "./core/geometry";
import { lessonDimensions, type State, selectedStep, writeState } from "./core/state";
import { exactTable, sectionDrawing, unitDrawing } from "./drawing";
import sourceHashes from "./source-hashes.json";

function download(text: string, mime: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function quantitiesCSV(state: State): string {
  const rows = [
    { scope: "reading", ...measuredRow(lessonDimensions(state)) },
    { scope: "experiment_face", ...measuredRow(state.lab) },
  ];
  const keys = Object.keys(rows[0] ?? {});
  return `${keys.join(",")}\n${rows.map((r) => keys.map((k) => r[k as keyof typeof r]).join(",")).join("\n")}\n`;
}
export function downloadCSV(state: State) {
  download(quantitiesCSV(state), "text/csv;charset=utf-8", `seked-${state.problem}-quantities.csv`);
}
async function checkedImage(file: string): Promise<string> {
  const expected = sourceHashes.find((s) => s.file === file);
  if (!expected) throw new Error("Unknown source");
  const r = await fetch(`${import.meta.env.BASE_URL}sources/${file}`);
  if (!r.ok) throw new Error("Source unavailable");
  const data = await r.arrayBuffer();
  const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", data))]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
  if (digest !== expected.sha256 || data.byteLength !== expected.bytes)
    throw new Error("Source edition mismatch");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(new Blob([data], { type: "image/jpeg" }));
  });
}
export function readingHTML(state: State, images: Record<string, string>): string {
  const p = getProblem(state.problem),
    dim = lessonDimensions(state),
    step = selectedStep(state);
  const pages: Array<number | "peet"> = [
    p.literal,
    p.plate,
    36,
    37,
    ...(["59", "59B"].includes(state.problem) ? ["peet" as const] : []),
  ];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Seked · problem ${p.id}</title><style>
:root{--ink:#242c2a;--red:#9b3d2f;--blue:#286477;--muted:#62645b;--line:#c9c9bd}*{box-sizing:border-box}body{max-width:980px;margin:36px auto;padding:0 24px;font:17px/1.6 Georgia,serif;color:var(--ink)}h1,h2,h3{line-height:1.25}a{color:var(--red)}.figures{display:grid;grid-template-columns:1.2fr 1fr;gap:20px;align-items:center}svg{display:block;width:100%;height:auto}svg text{font:14px Arial,sans-serif;fill:var(--ink)}svg .plate-label{font-size:10px;fill:var(--muted)}svg .outline{fill:none;stroke:var(--ink);stroke-width:1.8}svg .half-shape{fill:#e8ece4;stroke:none}svg .height{stroke:var(--blue);stroke-width:2}svg .run{stroke:var(--red);stroke-width:2}svg .height-label{fill:var(--blue)}svg .run-label{fill:var(--red)}svg .emphasized{stroke-width:4}svg .right-angle,svg .base-rule{fill:none;stroke:var(--muted);stroke-width:1}svg .unit-tick{stroke:var(--blue);stroke-width:1}table{border-collapse:collapse;width:100%;font:14px/1.5 Arial,sans-serif}th,td{padding:9px;border-bottom:1px solid var(--line);text-align:left}.equation{color:var(--red);border-left:3px solid var(--red);padding-left:15px}.steps li{padding:6px 0}figure{margin:25px 0}.sources img{display:block;width:100%;height:auto}.sources figcaption{font-size:14px}.words{display:grid;grid-template-columns:1fr 1fr;gap:0 28px}footer{font-size:13px;border-top:1px solid var(--line);padding-top:15px;margin-top:30px}@media(max-width:600px){.figures,.words{grid-template-columns:1fr}.figures svg{max-height:360px}body{padding:0 18px}table{font-size:12px}}
@page{size:A4;margin:14mm}@media print{body{margin:0;padding:0;font-size:11px;max-width:none}h1{font-size:26px}h2{font-size:19px}h2,h3{break-after:avoid}.figures{display:grid;grid-template-columns:1.2fr 1fr;break-inside:avoid;max-height:300px}.figures svg{max-height:290px}.steps li{break-inside:avoid}table{font-size:10px}tr{break-inside:avoid}.words{display:grid;grid-template-columns:1fr 1fr}.words article{break-inside:avoid}.sources{break-before:page}.sources figure{break-before:page;break-inside:avoid;margin:0}.sources img{max-height:850px;width:auto;max-width:100%;margin:auto}.sources figcaption{font-size:10px}.sources figure:first-of-type img{max-height:760px}.sources figure:first-of-type{break-before:auto}}
</style></head><body><h1>Problem ${p.id}: ${p.title}</h1><p>${p.question}</p><p>Selected step ${state.step + 1}: <strong>${step.title}</strong>. ${p.id === "59" ? `Selected dimensions: ${state.reading === "written" ? "as stated (side 8, height 12)" : "used in the working (side 12, height 8)"}.` : ""}</p><div class="figures">${sectionDrawing(dim, "face", step.emphasis, "saved-section", p.id === "60" ? "SYMMETRICAL SECTION · SOLID UNDECIDED" : undefined)}${unitDrawing(dim, "face", "saved-unit")}</div><p>A modern section at equal scales: base ${mixed(dim.base)}, height ${mixed(dim.height)}. The horizontal measure is <strong>${mixed(slope(dim).palms)} palms per vertical cubit</strong>. One cubit is seven palms; one palm is four fingers. ${p.id === "60" ? "The source’s written reciprocal result is discussed below; this diagram uses horizontal run per vertical rise." : ""}</p><p>${p.observation}</p><ol class="steps">${p.steps.map((s) => `<li><h3>${s.title}</h3><p>${s.text}</p><p class="equation">${s.equation}</p></li>`).join("")}</ol><h2>Exact quantities for this reading</h2>${exactTable(dim)}<p>The experiment controls were saved at base ${exact(state.lab.base)}, height ${exact(state.lab.height)}, section ${state.section}. The lesson drawings above retain the selected source dimensions.</p><h2>Words in the printed edition</h2><div class="words">${words.map((w) => `<article><h3>${w.word} · ${w.gloss}</h3><p>${w.note}</p></article>`).join("")}</div><p>These are consonantal transliterations, not recovered pronunciations. The drawings are modern explanations; they do not reconstruct a named monument or its construction method. The face-slope interpretation follows the cited editions.</p><section class="sources"><h2>The complete source pages</h2><p>Chace, Bull and Manning, <cite>The Rhind Mathematical Papyrus</cite>, volume II (1929). The transcription, literal translation and the two papyrus photographs are separate kinds of evidence. ${pages.includes("peet") ? "Peet’s 1923 p. 100 is also included for comparison." : ""}</p>${pages
    .map((n) => {
      const file = n === "peet" ? "peet-100.jpg" : `chace2-${String(n).padStart(3, "0")}.jpg`;
      return `<figure><figcaption><strong>${n === "peet" ? "Peet (1923), p. 100" : sourceLabel(n)}</strong>. <a href="${n === "peet" ? "https://archive.org/details/Peet_1923/page/n103/mode/1up" : sourceURL(n)}">Scanned edition</a>.</figcaption><img src="${images[file]}" alt="Complete source page: ${n === "peet" ? "Peet 100" : sourceLabel(n)}"></figure>`;
    })
    .join(
      "",
    )}</section><footer><a href="https://antonsoo.github.io/seked/${writeState(state)}#reader">Open this reading in Seked</a>. This document contains its source images and opens offline. Code and new illustrations: MIT, Anton Soloviev, 2026. Historical editions: public domain in the United States; see the repository’s third-party notices for provenance.</footer></body></html>`;
}
export async function saveReading(state: State) {
  const snapshot = { ...state, lab: { ...state.lab } },
    p = getProblem(snapshot.problem);
  const files = [
    ...new Set([p.literal, p.plate, 36, 37].map((n) => `chace2-${String(n).padStart(3, "0")}.jpg`)),
    ...(["59", "59B"].includes(p.id) ? ["peet-100.jpg"] : []),
  ];
  const images = Object.fromEntries(
    await Promise.all(files.map(async (f) => [f, await checkedImage(f)])),
  );
  download(
    readingHTML(snapshot, images),
    "text/html;charset=utf-8",
    `seked-${p.id}-${snapshot.reading}-reading.html`,
  );
}
