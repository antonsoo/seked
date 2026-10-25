import "./style.css";
import "./frustum-figure.css";
import "./frustum.css";
import { exact, mixed, parseDimension } from "./core/fraction";
import {
  type FrustumState,
  frustumJSON,
  frustumQuery,
  initialFrustum,
  parseFrustumQuery,
  readFrustumJSON,
  sliceAt,
  topDimension,
  validDimensions,
  volumes,
} from "./core/frustum";
import { frustumSteps, modelBoundary, proofHTML, sourceDescriptions } from "./frustum-content";
import {
  paperDimensions,
  productDrawing,
  sectionDrawing,
  solidDrawing,
  sourceNumbers,
  volumeTable,
} from "./frustum-drawing";
import {
  checkedFrustumSource,
  downloadFrustum,
  frustumCSV,
  frustumReading,
  frustumSVG,
  sourceLink,
} from "./frustum-export";
import sources from "./frustum-sources.json";
import { offlineStatus } from "./offline";

function get<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing ${id}`);
  return el as T;
}
const parsed = parseFrustumQuery(location.search);
let state = parsed.state;
let sourceAttempt = 0,
  renderedSource = 0,
  scanURL = "",
  enlarged = false;
get("app").innerHTML = `<a class="skip" href="#pieces">Skip to the solid</a>
<header><a class="wordmark" href="./">SEKED<span>Moscow / 14</span></a><nav aria-label="Main"><a href="./">Pyramid slopes</a><a href="#pieces">Separate the solid</a><a href="#calculation">Read the calculation</a><a href="#sources">Printed evidence</a></nav></header>
<main class="f-main"><section class="f-intro"><div><p class="eyebrow">Egyptian geometry / a solid you can take apart</p><h1>A pyramid<br>without its point.</h1></div><div class="f-intro-copy"><p>Four below. Two above. Six high.<br>The calculation on the papyrus ends at <strong>56</strong>.</p><p>Separate nine pieces to see why that volume is exact. Then read the recorded operations and the original printed evidence.</p><p class="caption">Moscow mathematical papyrus, problem 14.<br>The dissection is a modern explanation.</p></div></section>
<p id="message" class="f-message" role="status"></p>
<section id="pieces" aria-labelledby="pieces-title"><div class="section-heading"><p class="eyebrow">01 / The modern dissection</p><a href="#calculation">The recorded example stays 4, 2, 6</a></div>
<div class="f-lab-heading"><h2 id="pieces-title" tabindex="-1">One prism. Four wedges.<br>Four corner pyramids.</h2><p id="shape-note">The four planes through the upper square’s edges divide the solid. Move the pieces apart; their volumes stay fixed.</p></div>
<form id="dimension-form" class="f-dimensions"><div><label for="lower-side">Lower square side / a</label><input id="lower-side" type="text" inputmode="text" aria-describedby="dimension-help" /></div><div><label for="upper-side">Upper square side / b</label><input id="upper-side" type="text" inputmode="text" aria-describedby="dimension-help" /></div><div><label for="solid-height">Vertical height / h</label><input id="solid-height" type="text" inputmode="text" aria-describedby="dimension-help" /></div><button type="submit">Draw these dimensions</button></form>
<p id="dimension-help" class="caption">One common length unit. Fractions and mixed numbers work. From 1/100 to 500; the upper side may also be zero and cannot exceed the lower side.</p><p id="dimension-error" class="f-error" role="status"></p>
<div class="f-presets" role="group" aria-label="Solid examples"><button type="button" data-preset="papyrus">4, 2, 6 / papyrus</button><button type="button" data-preset="other">4, 3, 6 / another top</button><button type="button" data-preset="prism">4, 4, 6 / a prism</button><button type="button" data-preset="pyramid">4, 0, 6 / a pyramid</button></div>
<div class="f-lab"><div class="f-plate"><div id="solid-drawing"></div><p class="caption f-plate-note" id="solid-note"></p>
<div class="f-view-controls"><div><label for="view-turn">Turn the view <output id="turn-value" for="view-turn"></output></label><input id="view-turn" type="range" min="10" max="80" value="35" /></div><div><label for="cut-height">Horizontal cut <output id="cut-value" for="cut-height"></output></label><input id="cut-height" type="range" min="0" max="100" value="50" /></div></div>
</div><div class="f-control-column"><div class="f-spread"><label for="spread">Separate the pieces <output id="spread-value" for="spread"></output></label><input id="spread" type="range" min="0" max="100" value="0" /><div class="f-spread-buttons"><button id="assemble" type="button">Assemble</button><button id="separate" type="button">Separate</button></div></div>
<p class="caption f-part-prompt">Isolate a group in the drawing</p><div class="f-part-buttons" role="group" aria-label="Highlighted pieces"><button type="button" data-part="all">All pieces</button><button type="button" data-part="core"><span class="f-swatch core" aria-hidden="true"></span>1 prism</button><button type="button" data-part="wedges"><span class="f-swatch wedges" aria-hidden="true"></span>4 wedges</button><button type="button" data-part="corners"><span class="f-swatch corners" aria-hidden="true"></span>4 pyramids</button></div>
<p id="part-note" class="caption"></p><div id="volume-table"></div><p id="total-equation" class="f-sum"></p>
</div></div>
<div class="f-cut-explanation"><div id="section-drawing"></div><div><p class="eyebrow">A slice has area. The solid has volume.</p><h3 id="cut-description"></h3><p>The square’s side changes linearly from the lower side to the upper side. Its area changes as the <em>square</em> of that side.</p><div id="estimate-comparison"></div><p class="caption">These two estimates agree with the exact volume for a prism. Tapering opens the gap. All numbers here are calculated exactly; the drawing’s coordinates are rounded.</p></div></div>
<details class="f-proof"><summary>Follow the volumes of the nine pieces</summary>${proofHTML}<p>${modelBoundary}</p></details>
</section>
<section id="calculation" aria-labelledby="calculation-title"><div class="section-heading"><p class="eyebrow">02 / The recorded example</p><p>Six operations / printed p. 101</p></div><div class="f-lab-heading"><h2 id="calculation-title">Keep the written numbers.<br>Follow their order.</h2><p>This reading always uses lower side 4, upper side 2 and height 6. The English quotations come from Touraeff’s 1917 translation.</p></div>
<div class="f-reading"><div><div id="source-products">${productDrawing(paperDimensions(), "papyrus-products")}</div><p class="caption">16 + 8 + 4 = 28. These are separate products; 28 is not a section of the solid. The middle product 8 differs from the midheight square’s area 9.</p></div><div class="f-reading-panel"><div class="f-step-buttons" role="group" aria-label="Recorded operation">${frustumSteps.map((step, i) => `<button type="button" data-step="${i}" aria-label="Operation ${i + 1}: ${step.title}">${i + 1}</button>`).join("")}</div><div id="reading-text"></div><div class="f-reading-actions"><button id="previous-step" type="button">Previous</button><button id="next-step" type="button">Next</button><button id="inspect-translation" type="button">Inspect the printed translation</button></div></div></div>
<details class="f-generalization"><summary>From “double four” to a product of two sides</summary><p>The translation gives a particular command: double 4 to obtain 8. Because the upper side is 2, the same result is 4 × 2. The editor’s bracketed note on p. 102 identifies the product of the sides as the simpler expression.</p><p>For a different top, the modern extension uses ab. It does not keep doubling the lower side. The dissection establishes that extension mathematically; the one surviving numerical example alone does not reveal how the rule was discovered.</p><button type="button" id="inspect-note">Inspect the editor’s note</button></details>
<div class="f-number-reading"><div><h3>Read the numbers in the transcription.</h3><p>Printed p. 100 places a hieroglyphic transcription next to the diagram. Additive tens and unit strokes let you compare the square 16 with the final 56.</p><p class="caption">This is a modern schematic of the number signs, with different grouping and orientation. The printed transcription is an editor’s reading of the cursive hieratic text. It is not a photograph of the original writing.</p><button type="button" id="inspect-numbers">Inspect the transcription</button></div><div>${sourceNumbers()}</div></div>
</section>
<section id="sources" aria-labelledby="sources-title"><div class="section-heading"><p class="eyebrow">03 / Inspect the evidence</p><p>Three complete printed pages / 1917</p></div><h2 id="sources-title" tabindex="-1">The calculation and an early interpretation.</h2><p class="f-source-intro">B. Touraeff, <cite>${sources.title}</cite>, <cite>Ancient Egypt</cite> (1917), pp. 100–102. The early publication preserves its own uncertainties. Its old column labels and counts precede Struve’s complete 1930 edition; “problem 14” is the later conventional numbering.</p>
<div class="f-source-buttons" role="group" aria-label="Printed source page">${sources.images.map((img) => `<button type="button" data-page="${img.page}">p. ${img.page} / ${img.page === 100 ? "transcription" : img.page === 101 ? "translation" : "editor’s note"}</button>`).join("")}</div>
<p id="source-note" class="caption"></p><figure class="f-source-figure"><div id="source-window" tabindex="0" role="region" aria-label="Verified complete source page; scroll to inspect the printed text"></div><figcaption id="source-caption"></figcaption></figure><div class="f-source-actions"><button id="enlarge-source" type="button" aria-pressed="false">Enlarge the page</button><a id="original-source">Open the digitized original</a><a id="retained-source">Open the retained image</a><a href="sources/frustum/NOTICES.txt">Provenance and rights</a></div>
<p class="caption">The photograph on p. 101 has severe tonal loss in this digitization. It has been left as supplied. The typeset transcription on p. 100 and the printed interpretation are different evidence. The statement that the rule could only have been found empirically is Touraeff’s conjecture; this example supplies no derivation.</p>
</section>
<section id="keep" aria-labelledby="keep-title"><div class="section-heading"><p class="eyebrow">04 / Keep the experiment</p></div><h2 id="keep-title">A reading you can take away.</h2><p>The illustrated HTML includes your settings, assembled and separated solids, exact quantities, all six reading steps, all three verified source pages, fonts and licenses. Open it independently and use your browser’s Print command for a PDF.</p><div class="f-downloads"><button id="save-reading" type="button">Save illustrated reading / HTML</button><button id="save-svg" type="button">Save solid / SVG</button><button id="save-csv" type="button">Save exact quantities / CSV</button><button id="save-json" type="button">Save editable settings / JSON</button><button id="share" type="button">Copy link</button></div><div class="f-reopen"><label for="open-settings">Reopen a drawing / JSON</label><input type="file" id="open-settings" accept=".json,application/json" /></div><p id="export-status" role="status"></p><label id="share-label" for="share-link" hidden>Link to these settings</label><input id="share-link" type="text" readonly hidden />
</section><section class="f-limits"><h2>An explanation has inputs.</h2><p>${modelBoundary}</p><p>The one-third pyramid-volume theorem is an explicit premise. Lengths are exact fractions; projected coordinates are rounded. This lesson uses a preliminary 1917 edition, not a new critical edition or a new translation of the Egyptian. It does not assign a modern length to an ancient unit.</p><a href="./">Return to the Rhind papyrus’s slope calculations</a></section>
</main><footer><span>Seked · <a href="https://github.com/antonsoo/seked">Source & licenses</a></span><span id="offline" role="status">Preparing the offline reading…</span></footer>`;

function status(text: string) {
  get("export-status").textContent = text;
}
function update(next: FrustumState, push = true, hash = location.hash, syncForm = false) {
  state = next;
  history[push ? "pushState" : "replaceState"](
    null,
    "",
    `${location.pathname}${frustumQuery(state)}${hash}`,
  );
  render(syncForm);
}
async function renderSource() {
  const attempt = ++sourceAttempt,
    page = state.source;
  renderedSource = page;
  get("source-note").textContent = sourceDescriptions[page]?.note ?? "";
  get("source-caption").textContent = `Printed p. ${page}. ${sourceDescriptions[page]?.title}.`;
  get<HTMLAnchorElement>("original-source").href = sourceLink(page);
  get<HTMLAnchorElement>("retained-source").href = `sources/frustum/touraeff-${page}.jpg`;
  get("source-window").replaceChildren();
  get("source-window").textContent = "Checking the printed page…";
  if (scanURL) {
    URL.revokeObjectURL(scanURL);
    scanURL = "";
  }
  try {
    const bytes = await checkedFrustumSource(page);
    if (attempt !== sourceAttempt) return;
    const img = new Image();
    img.alt = `Complete printed page ${page}: ${sourceDescriptions[page]?.title}`;
    scanURL = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    img.src = scanURL;
    await img.decode();
    if (attempt !== sourceAttempt) return;
    get("source-window").replaceChildren(img);
    get("source-caption").textContent =
      `Printed p. ${page}. ${sourceDescriptions[page]?.title}. Retained bytes verified with SHA-256.`;
    const win = get("source-window");
    win.scrollTop = 0;
    win.scrollLeft = 0;
  } catch (error) {
    if (attempt === sourceAttempt) {
      get("source-window").textContent =
        error instanceof Error ? error.message : "The source could not be loaded.";
      renderedSource = 0;
    }
  }
}
function render(syncForm = false) {
  const v = volumes(state),
    cut = sliceAt(state, state.cut),
    step = frustumSteps[state.step] ?? frustumSteps[0];
  if (syncForm) {
    get<HTMLInputElement>("lower-side").value = exact(state.base);
    get<HTMLInputElement>("upper-side").value = exact(state.top);
    get<HTMLInputElement>("solid-height").value = exact(state.height);
    get("dimension-error").textContent = "";
    for (const id of ["lower-side", "upper-side", "solid-height"])
      get(id).removeAttribute("aria-invalid");
  }
  get("solid-drawing").innerHTML = solidDrawing(state);
  get("section-drawing").innerHTML = sectionDrawing(state);
  get("volume-table").innerHTML = volumeTable(state);
  get("total-equation").textContent =
    `${mixed(v.core)} + ${mixed(v.wedges)} + ${mixed(v.corners)} = ${mixed(v.total)} cubic units`;
  get("solid-note").textContent =
    state.spread === 0
      ? "The dashed square marks your horizontal cut. Choose Separate to expose the partition."
      : "The pieces have only been translated. Assemble them to locate the horizontal cut on the solid.";
  get("shape-note").textContent =
    state.top.n === 0n
      ? "At an upper side of zero, only the four corner pyramids have nonzero volume. Their apices meet at the full pyramid’s tip."
      : v.difference.n === 0n
        ? "With equal upper and lower sides, the solid is a prism. The wedges and corner pyramids have zero volume."
        : "The four planes through the upper square’s edges divide the solid. Move the pieces apart; their volumes stay fixed.";
  for (const [id, key, label] of [
    ["spread", "spread", `${state.spread}/100`],
    ["view-turn", "turn", `${state.turn}°`],
    ["cut-height", "cut", `${state.cut}% of height`],
  ] as const) {
    get<HTMLInputElement>(id).value = String(state[key]);
    get(id).setAttribute("aria-valuetext", label);
  }
  get("spread-value").textContent = `${state.spread}/100`;
  get("turn-value").textContent = `${state.turn}°`;
  get("cut-value").textContent = `${state.cut}%`;
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-part]"))
    b.setAttribute("aria-pressed", String(b.dataset.part === state.part));
  const partVolume =
    state.part === "core"
      ? v.core
      : state.part === "wedges"
        ? v.wedges
        : state.part === "corners"
          ? v.corners
          : v.total;
  get("part-note").textContent =
    partVolume.n === 0n
      ? "This group has zero volume at these dimensions; it is omitted from the drawing."
      : state.part === "all"
        ? "The table retains all groups, including any zero volumes."
        : "The other groups are faded. The table retains every group.";
  get("cut-description").textContent =
    `At height ${mixed(cut.height)}, side ${mixed(cut.side)} gives area ${mixed(cut.area)}.`;
  get("estimate-comparison").innerHTML =
    `<table class="f-estimates"><caption>Three volumes for your chosen dimensions / cubic units</caption><tbody><tr><th scope="row">Mean end area × height</th><td>${mixed(v.endAverage)}</td><td>${v.endError.n ? `${mixed(v.endError)} too much` : "exact"}</td></tr><tr><th scope="row">Midheight square × height</th><td>${mixed(v.middleSquare)}</td><td>${v.middleError.n ? `${mixed(v.middleError)} too little` : "exact"}</td></tr><tr><th scope="row">Nine-piece total</th><td>${mixed(v.total)}</td><td>exact</td></tr></tbody></table>`;
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-step]"))
    b.setAttribute("aria-pressed", String(Number(b.dataset.step) === state.step));
  get("reading-text").innerHTML =
    `<p class="eyebrow">Operation ${state.step + 1} / 6</p><h3>${step.title}</h3><blockquote>${step.quote}</blockquote><p class="f-operation">${step.equation}</p><p>${step.note}</p>`;
  get<HTMLButtonElement>("previous-step").disabled = state.step === 0;
  get<HTMLButtonElement>("next-step").disabled = state.step === 5;
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-page]"))
    b.setAttribute("aria-pressed", String(Number(b.dataset.page) === state.source));
  if (renderedSource !== state.source) void renderSource();
}
get<HTMLFormElement>("dimension-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const base = parseDimension(get<HTMLInputElement>("lower-side").value),
    top = topDimension(get<HTMLInputElement>("upper-side").value),
    height = parseDimension(get<HTMLInputElement>("solid-height").value);
  for (const [id, v] of [
    ["lower-side", base],
    ["upper-side", top],
    ["solid-height", height],
  ] as const)
    get(id).setAttribute("aria-invalid", String(!v));
  if (!base || !top || !height) {
    get("dimension-error").textContent =
      "Use positive dimensions from 1/100 to 500. The upper side may also be zero. Try 4, 2 and 6, or a fraction such as 7/2.";
    return;
  }
  if (!validDimensions(base, top, height)) {
    get("upper-side").setAttribute("aria-invalid", "true");
    get("dimension-error").textContent =
      "The upper square cannot be wider than the lower square. The previous valid solid is still shown.";
    return;
  }
  update({ ...state, base, top, height }, true, location.hash, true);
});
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-preset]"))
  b.addEventListener("click", () => {
    const next = initialFrustum();
    if (b.dataset.preset === "other") next.top = topDimension("3") ?? next.top;
    if (b.dataset.preset === "prism") next.top = next.base;
    if (b.dataset.preset === "pyramid") next.top = topDimension("0") ?? next.top;
    update(
      { ...state, base: next.base, top: next.top, height: next.height },
      true,
      location.hash,
      true,
    );
  });
for (const [id, key] of [
  ["spread", "spread"],
  ["view-turn", "turn"],
  ["cut-height", "cut"],
] as const) {
  let started = false;
  get(id).addEventListener("input", () => {
    const next = { ...state, [key]: Number(get<HTMLInputElement>(id).value) };
    update(next, !started);
    started = true;
  });
  get(id).addEventListener("change", () => {
    started = false;
  });
}
get("assemble").addEventListener("click", () => update({ ...state, spread: 0 }));
get("separate").addEventListener("click", () => update({ ...state, spread: 80 }));
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-part]"))
  b.addEventListener("click", () =>
    update({ ...state, part: b.dataset.part as FrustumState["part"] }),
  );
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-step]"))
  b.addEventListener("click", () => update({ ...state, step: Number(b.dataset.step) }));
get("previous-step").addEventListener("click", () =>
  update({ ...state, step: Math.max(0, state.step - 1) }),
);
get("next-step").addEventListener("click", () =>
  update({ ...state, step: Math.min(5, state.step + 1) }),
);
function inspect(page: number) {
  update({ ...state, source: page }, true, "#sources");
  get("sources-title").focus();
  get("sources").scrollIntoView();
}
get("inspect-translation").addEventListener("click", () => inspect(101));
get("inspect-note").addEventListener("click", () => inspect(102));
get("inspect-numbers").addEventListener("click", () => inspect(100));
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-page]"))
  b.addEventListener("click", () => {
    if (renderedSource === 0 && state.source === Number(b.dataset.page)) void renderSource();
    else update({ ...state, source: Number(b.dataset.page) });
  });
get("enlarge-source").addEventListener("click", () => {
  enlarged = !enlarged;
  get("source-window").classList.toggle("enlarged", enlarged);
  get("enlarge-source").setAttribute("aria-pressed", String(enlarged));
  get("enlarge-source").textContent = enlarged ? "Fit the page width" : "Enlarge the page";
});
let exporting = false;
async function exportFile(
  id: string,
  create: (snapshot: FrustumState) => Promise<string>,
  type: string,
  name: string,
) {
  if (exporting) return;
  exporting = true;
  get<HTMLButtonElement>(id).disabled = true;
  status("Preparing the complete file…");
  const snapshot = { ...state };
  try {
    downloadFrustum(await create(snapshot), type, name);
    status(`Saved ${name}.`);
  } catch (error) {
    status(error instanceof Error ? error.message : "The complete file could not be saved.");
  } finally {
    exporting = false;
    get<HTMLButtonElement>(id).disabled = false;
  }
}
get("save-reading").addEventListener(
  "click",
  () =>
    void exportFile(
      "save-reading",
      frustumReading,
      "text/html;charset=utf-8",
      "seked-frustum-reading.html",
    ),
);
get("save-svg").addEventListener(
  "click",
  () => void exportFile("save-svg", frustumSVG, "image/svg+xml;charset=utf-8", "seked-frustum.svg"),
);
get("save-csv").addEventListener("click", () => {
  downloadFrustum(frustumCSV(state), "text/csv;charset=utf-8", "seked-frustum.csv");
  status("Saved exact quantities as CSV.");
});
get("save-json").addEventListener("click", () => {
  downloadFrustum(frustumJSON(state), "application/json", "seked-frustum.json");
  status("Saved editable drawing settings.");
});
get<HTMLInputElement>("open-settings").addEventListener("change", async (event) => {
  const input = event.currentTarget as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 16000) throw new Error("The drawing file is too large (16 KB maximum).");
    const next = readFrustumJSON(await file.text());
    update(next, true, "#pieces", true);
    status("Opened the drawing settings.");
  } catch (error) {
    status(error instanceof Error ? error.message : "This drawing could not be read.");
  } finally {
    input.value = "";
  }
});
get("share").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}${frustumQuery(state)}#pieces`;
  const input = get<HTMLInputElement>("share-link");
  input.value = url;
  input.hidden = false;
  get("share-label").hidden = false;
  try {
    await navigator.clipboard.writeText(url);
    status("Copied the link, including the dimensions, view and reading step.");
  } catch {
    input.focus();
    input.select();
    status("Copy the selected link.");
  }
});
window.addEventListener("popstate", () => {
  const parsed = parseFrustumQuery(location.search);
  state = parsed.state;
  get("message").textContent = parsed.warning;
  render(true);
});
// Keep the current image URL valid while the document is in Back/Forward cache.
// Selection changes revoke replaced URLs; document destruction releases the last.
get("message").textContent = parsed.warning;
render(true);
void offlineStatus(get("offline"));
