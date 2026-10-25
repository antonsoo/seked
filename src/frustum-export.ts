import { exact, mixed } from "./core/fraction";
import { type FrustumState, frustumQuery, sliceAt, volumes } from "./core/frustum";
import { frustumSteps, modelBoundary, proofHTML, sourceDescriptions } from "./frustum-content";
import {
  escapeHTML as e,
  productDrawing,
  sectionDrawing,
  solidDrawing,
  sourceNumbers,
  volumeTable,
} from "./frustum-drawing";
import drawingCSS from "./frustum-figure.css?inline";
import sources from "./frustum-sources.json";

export function downloadFrustum(text: string, mime: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function frustumCSV(s: FrustumState): string {
  const v = volumes(s),
    cut = sliceAt(s, s.cut);
  const rows: (string | number)[][] = [
    ["scope", "quantity", "exact_value", "unit"],
    ["experiment", "lower_side", exact(s.base), "length"],
    ["experiment", "upper_side", exact(s.top), "length"],
    ["experiment", "height", exact(s.height), "length"],
    ["experiment", "lower_square", exact(v.lowerArea), "area"],
    ["experiment", "side_product", exact(v.productArea), "area"],
    ["experiment", "upper_square", exact(v.upperArea), "area"],
    ["experiment", "sum_of_three_products", exact(v.areaSum), "area"],
    ["experiment", "central_prism", exact(v.core), "volume"],
    ["experiment", "one_wedge", exact(v.wedge), "volume"],
    ["experiment", "four_wedges", exact(v.wedges), "volume"],
    ["experiment", "one_corner_pyramid", exact(v.corner), "volume"],
    ["experiment", "four_corner_pyramids", exact(v.corners), "volume"],
    ["experiment", "total", exact(v.total), "volume"],
    ["comparison", "end_area_average_times_height", exact(v.endAverage), "volume"],
    ["comparison", "midheight_area_times_height", exact(v.middleSquare), "volume"],
    ["comparison", "end_average_excess", exact(v.endError), "volume"],
    ["comparison", "midheight_shortfall", exact(v.middleError), "volume"],
    ["slice", "height", exact(cut.height), "length"],
    ["slice", "side", exact(cut.side), "length"],
    ["slice", "area", exact(cut.area), "area"],
    ...frustumSteps.map((step, i) => [
      "papyrus_example",
      `operation_${i + 1}`,
      step.result,
      "number",
    ]),
  ];
  return `${rows.map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n")}\n`;
}
export function dataURL(bytes: ArrayBuffer, type: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to embed the file."));
    reader.readAsDataURL(new Blob([bytes], { type }));
  });
}
export async function checkedFrustumSource(page: number): Promise<ArrayBuffer> {
  const file = sources.images.find((s) => s.page === page);
  if (!file) throw new Error("Unknown printed source page.");
  const response = await fetch(`${import.meta.env.BASE_URL}sources/frustum/${file.file}`);
  if (!response.ok)
    throw new Error(`Printed page ${page} is unavailable. Reconnect and try again.`);
  const bytes = await response.arrayBuffer();
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  if (bytes.byteLength !== file.bytes || digest !== file.sha256)
    throw new Error(
      `Printed page ${page} does not match the retained edition. No substitute image was used.`,
    );
  return bytes;
}
async function asset(file: string): Promise<ArrayBuffer> {
  const response = await fetch(`${import.meta.env.BASE_URL}${file}`);
  if (!response.ok)
    throw new Error(`The reading could not include ${file}. Reconnect and try again.`);
  return response.arrayBuffer();
}
export const sourceLink = (page: number) =>
  `https://archive.org/details/${sources.archive}/page/n${sources.images.find((s) => s.page === page)?.archiveLeaf}/mode/1up`;

export async function frustumSVG(s: FrustumState): Promise<string> {
  const font = await dataURL(await asset("fonts/AtkinsonHyperlegibleNext.ttf"), "font/ttf");
  return solidDrawing(s, "saved-solid").replace(
    '<g class="mesh">',
    `<style>@font-face{font-family:Atkinson;src:url("${font}")}svg{background:#f7f5ef}${drawingCSS}</style><g class="mesh">`,
  );
}

export async function frustumReading(s: FrustumState): Promise<string> {
  const [sans, serif, licenses, sourceNotice, ...images] = await Promise.all([
    asset("fonts/AtkinsonHyperlegibleNext.ttf").then((b) => dataURL(b, "font/ttf")),
    asset("fonts/NotoSerif-Regular.ttf").then((b) => dataURL(b, "font/ttf")),
    Promise.all([asset("fonts/Atkinson-OFL.txt"), asset("fonts/NotoSerif-OFL.txt")]).then((a) =>
      a.map((b) => new TextDecoder().decode(b)).join("\n\n"),
    ),
    asset("sources/frustum/NOTICES.txt").then((b) => new TextDecoder().decode(b)),
    ...sources.images.map((img) =>
      checkedFrustumSource(img.page).then((b) => dataURL(b, "image/jpeg")),
    ),
  ]);
  const v = volumes(s),
    url = `https://antonsoo.github.io/seked/frustum.html${frustumQuery(s)}#pieces`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>A pyramid without its point · Seked</title><style>
  @font-face{font-family:Atkinson;src:url("${sans}")}@font-face{font-family:Noto;src:url("${serif}")}
  ${drawingCSS}
  *{box-sizing:border-box}body{overflow-wrap:anywhere;margin:40px auto;max-width:1000px;padding:0 24px;color:#242c2a;background:#f7f5ef;font:17px/1.6 Atkinson,sans-serif}h1,h2,h3{font-family:Noto,serif;line-height:1.2;font-weight:400}h1{font-size:44px}h2{font-size:30px;margin-top:45px}h3{font-size:23px}a{color:#9b3d2f}svg{display:block;width:100%;height:auto}.drawing-pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}.saved-section{max-width:360px;margin:auto}.formula{font-size:20px}.source-page img{display:block;max-width:100%;height:auto;margin:auto}.source-page{margin:35px 0}figcaption,.caption,footer{font-size:14px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border-bottom:1px solid #c9c9bd}caption{text-align:left;font-size:14px}ol li{margin:12px 0}blockquote{margin:12px 0;padding-left:18px;border-left:2px solid #9b3d2f}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.5 Atkinson,sans-serif}footer{border-top:1px solid #c9c9bd;padding-top:20px;margin-top:30px}
  @media(max-width:600px){body{padding:0 16px}.drawing-pair{grid-template-columns:1fr}h1{font-size:34px}table{font-size:14px}th,td{padding:7px}}
  @page{size:A4;margin:14mm}@media print{body{margin:0;padding:0;max-width:none;font-size:11px}h1{font-size:28px}h2{font-size:21px;margin-top:25px}h3{font-size:15px}h2,h3{break-after:avoid}.drawing-pair{display:grid;grid-template-columns:1fr 1fr;break-inside:avoid}.drawing-pair svg{max-height:300px}.saved-section{max-width:260px}table{font-size:11px}th,td{padding:5px}tr,li{break-inside:avoid}.source-pages{break-before:page}.source-page{break-before:page;break-inside:avoid;margin:0}.source-page:first-of-type{break-before:auto}.source-page img{max-height:890px;width:auto;max-width:100%}figcaption{font-size:10px}blockquote{margin:5px 0}.source-pages h2{margin-top:0}.source-page:first-of-type img{max-height:760px}.recorded-reading{break-before:page;line-height:1.45}.recorded-reading h2{margin-top:16px}.recorded-reading h3{margin:8px 0 4px}.recorded-reading li{margin:8px 0}.recorded-reading li p{margin:6px 0}.recorded-reading .formula{font-size:16px}.number-marks{max-width:330px}.licenses{break-before:page}pre{font-size:8px}}
  </style></head><body><p class="caption">SEKED / MOSCOW PAPYRUS 14 / SAVED READING</p><h1>A pyramid without its point.</h1>
  <p>The surviving example has lower side 4, upper side 2, and height 6. Its calculation gives 56. This reading preserves that example separately from your selected experiment.</p>
  <h2>Your experiment</h2><p>Lower side ${mixed(s.base)}, upper side ${mixed(s.top)}, height ${mixed(s.height)}. Spread ${s.spread}/100; turn ${s.turn}°; selected group ${s.part}; cut ${s.cut}% of the height. All lengths have one common chosen unit.</p>
  <div class="drawing-pair">${solidDrawing(s, "saved-pose")}${solidDrawing({ ...s, spread: s.spread === 0 ? 75 : 0 }, "saved-other-pose")}</div>
  <p class="caption">An assembled and a separated view of the same ideal solid. Moving pieces changes their positions, not their volumes. Vanishing pieces are omitted at a prism or pyramid boundary.</p>${volumeTable(s)}
  <div class="saved-section">${sectionDrawing(s, "saved-section")}</div><p class="caption">The cut’s square side changes linearly with height. Its area is the square of that side. A profile is drawn with equal horizontal and vertical scales.</p>
  <h2>Why nine pieces add to the rule</h2>${proofHTML}<p>${modelBoundary}</p>
  <h2>Two tempting estimates</h2><p>Average the end areas, then multiply by height: <strong>${mixed(v.endAverage)}</strong>, an excess of ${mixed(v.endError)}. Square the middle side, then multiply by height: <strong>${mixed(v.middleSquare)}</strong>, a shortfall of ${mixed(v.middleError)}. Exact volume: <strong>${mixed(v.total)}</strong>. All three agree for a prism; the first two miss a tapered solid.</p>
  ${productDrawing(s, "saved-products")}<p>The product sum ${mixed(v.areaSum)} is not the area of a horizontal slice. Multiplying its third by the height gives the volume.</p>
  <section class="recorded-reading"><h2>The recorded calculation: 4, 2, 6</h2><p>English quotations below are from Touraeff’s 1917 translation, printed p. 101. They are not new translations from the Egyptian. Your selected reading step was ${s.step + 1}.</p><ol>${frustumSteps.map((step) => `<li><h3>${step.title}</h3><blockquote>${step.quote}</blockquote><p class="formula">${step.equation}</p><p>${step.note}</p></li>`).join("")}</ol>
  <h2>Reading the number signs</h2><div class="number-marks">${sourceNumbers()}</div><p>The drawing above is a modern schematic of additive tens and units, not a tracing. Compare 16 and the final 56 in the typeset transcription on p. 100. Grouping and orientation in the printed page differ. Hieroglyphic transcription, cursive hieratic writing, and a modern Arabic numeral are separate representations.</p></section>
  <section class="source-pages"><h2>Complete printed evidence</h2><p>B. Touraeff, <cite>${sources.title}</cite>, <cite>Ancient Egypt</cite> (1917), pp. 100–102. This preliminary publication precedes Struve’s complete 1930 edition. Its older column labels are retained. No surviving dissection is supplied here.</p>${sources.images.map((img, i) => `<figure class="source-page"><figcaption><strong>Printed p. ${img.page}: ${sourceDescriptions[img.page]?.title}.</strong> ${sourceDescriptions[img.page]?.note} <a href="${sourceLink(img.page)}">Digitized original</a>. PDF p. ${img.pdfPage}; Archive leaf ${img.archiveLeaf}; SHA-256 ${img.sha256}.</figcaption><img src="${images[i]}" alt="Complete printed page ${img.page} of Touraeff’s original article"></figure>`).join("")}</section>
  <section class="licenses"><h2>Provenance and licenses</h2><pre>${e(sourceNotice)}</pre><h3>Embedded font licenses</h3><pre>${e(licenses)}</pre></section><footer><a href="${e(url)}">Open these settings in Seked</a>. New explanation, code and diagrams: MIT, © 2026 Anton Soloviev. This script-free document includes all source images and its fonts. Browser print settings and paper size can change pagination.</footer></body></html>`;
}
