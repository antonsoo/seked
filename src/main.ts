import { reckon, reckoning } from "./core/reckoning";
import "./style.css";
import {
  getProblem,
  type ProblemId,
  problems,
  type Reading,
  sourceCaption,
  sourceFocus,
  sourceLabel,
  sourceURL,
  words,
} from "./content";
import { exact, mixed, multiply, parseDimension } from "./core/fraction";
import { type Section, sectionCoordinates, slope } from "./core/geometry";
import { lessonDimensions, readState, selectedStep, writeState } from "./core/state";
import {
  decimalPalms,
  degreeLabel,
  dimensionsLabel,
  exactTable,
  planDrawing,
  sectionDrawing,
  unitDrawing,
} from "./drawing";
import { downloadCSV, saveReading } from "./export";
import { offlineStatus } from "./offline";
import sourceHashes from "./source-hashes.json";

function get<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing ${id}`);
  return el as T;
}
let state = readState(location.search);
let sourcePage: number | "peet" = getProblem(state.problem).literal;
let scanAnchor: { x: number; y: number } | null = null;
get("app").innerHTML =
  `<a class="skip" href="#reader">Skip to the reading</a><header><a class="wordmark" href="./">SEKED<span>Rhind / 56–60</span></a><nav aria-label="Main"><a href="#reader">The problems</a><a href="#workshop">Try a slope</a><a href="#evidence">Read the evidence</a></nav></header>
<main><section class="introduction"><div><p class="eyebrow">Egyptian geometry · a reading desk</p><h1>One cubit up.<br>How far inward?</h1></div><div class="intro-copy"><p>A pyramid’s slope can be described without an angle: count how many palms it goes inward for each cubit it rises.</p><p>Follow six exercises from the Rhind papyrus. Rebuild the calculation. Read the places where the written numbers disagree.</p><a href="#reader" class="text-link">Begin with problem 56 <span aria-hidden="true">↓</span></a></div></section>
<section id="reader" aria-labelledby="reader-title"><div class="section-heading"><p class="eyebrow">01 / Read the calculation</p><p>Six exercises · thirty short steps</p></div><div class="problem-choices" role="group" aria-label="Papyrus problem">${problems.map((p) => `<button type="button" data-problem="${p.id}" aria-pressed="false"><span>${p.id}</span>${p.id === "56" ? "Find the slope" : p.id === "57" ? "Find the height" : p.id === "58" ? "Reverse it" : p.id === "59" ? "Read a mismatch" : p.id === "59B" ? "Check the result" : "Take the reciprocal"}</button>`).join("")}</div>
<div class="reader-heading"><h2 id="reader-title" tabindex="-1"></h2><p id="question"></p></div>
<div id="reading-switch" class="reading-switch" role="group" aria-label="Problem 59 dimensions"><span>Draw the dimensions:</span><button type="button" data-reading="written">As stated: side 8, height 12</button><button type="button" data-reading="working">Used in working: side 12, height 8</button></div>
<div class="reading-desk"><div class="drawing-board"><div id="lesson-section"></div><p id="lesson-caption" class="caption"></p><div class="miniature"><div id="lesson-unit"></div><div class="unit-note"><p class="eyebrow">The small triangle</p><p><strong id="lesson-palms"></strong> of horizontal run<br>for one vertical cubit.</p><p class="caption">1 cubit = 7 palms<br>1 palm = 4 fingers</p></div></div></div>
<div class="calculation"><div class="step-heading"><p class="eyebrow" id="step-position"></p><div class="step-buttons" role="group" aria-label="Reading step">${Array.from({ length: 5 }, (_, i) => `<button type="button" data-step="${i}" aria-label="Step ${i + 1}" aria-pressed="false">${i + 1}</button>`).join("")}</div></div><div id="step-copy" aria-live="polite" aria-atomic="true"><h3 id="step-title"></h3><p id="step-text"></p><p id="step-equation" class="equation"></p></div><div class="previous-next"><button type="button" id="previous">← Previous</button><button type="button" id="next">Next step →</button></div><div class="source-note"><p class="eyebrow">Read this against the source</p><p id="observation"></p><button type="button" id="read-literal" class="text-button">Open the literal translation</button><button type="button" id="read-plate" class="text-button">Compare the handwritten signs</button><button type="button" id="read-peet" class="text-button" hidden>Compare Peet’s printed correction</button></div></div></div>
<section class="reckoning" aria-labelledby="reckoning-title"><div><p class="eyebrow">Reconstruct the operation</p><h3 id="reckoning-title"></h3><p id="reckoning-note"></p><div class="reckoning-actions"><button type="button" id="source-rows">Use the source’s choices</button><button type="button" id="clear-rows">Clear choices</button></div></div><div><table><caption>Select fractions or multiples to reach the target</caption><thead><tr><th>Choose</th><th>Multiplier</th><th>Result</th></tr></thead><tbody id="reckoning-rows"></tbody></table><p id="reckoning-sum" class="equation" role="status"></p></div></section><div class="reader-actions"><button type="button" id="share">Copy this reading</button><button type="button" id="save">Save illustrated reading</button><button type="button" id="csv">Download exact quantities</button><p id="action-status" role="status"></p></div>
<details class="numbers"><summary>Inspect the exact quantities used in this drawing</summary><div id="lesson-table"></div><p class="caption">The drawings use the completed dimensions. Steps explain the operations; they do not hide answers for a quiz. Rational values are exact, while displayed angles and drawing coordinates are rounded modern calculations.</p></details></section>
<section id="workshop" aria-labelledby="workshop-title"><div class="section-heading"><p class="eyebrow">02 / Try a slope</p><p>A modern experiment</p></div><div class="workshop-intro"><h2 id="workshop-title">A face and an edge<br>do not have the same slope.</h2><p>Change the dimensions of an ideal square pyramid. Look through a face midpoint, then through a corner. The corner lies farther from the center, so the edge is less steep. The papyrus calculation here uses the face section.</p></div>
<form id="dimensions-form" class="lab-controls"><div><label for="base">Base side / cubits</label><input id="base" type="text" inputmode="text" aria-describedby="dimension-help"></div><div><label for="height">Vertical height / cubits</label><input id="height" type="text" inputmode="text" aria-describedby="dimension-help"></div><button type="submit">Draw these dimensions</button><button type="button" id="use-lesson">Use this problem’s dimensions</button></form><p id="dimension-help" class="caption">Whole numbers, decimals, fractions (280/3), or mixed numbers (93 1/3). From 1/100 to 500 cubits. Both dimensions use the same unit; no length in metres is assumed.</p><p id="dimension-error" role="status"></p>
<div class="section-choices" role="group" aria-label="Section through the square pyramid"><button type="button" data-section="face">Through a face midpoint</button><button type="button" data-section="corner">Through a corner</button></div><div class="lab-drawings"><div><div id="lab-section"></div><p id="section-summary"></p></div><div class="plan-panel"><div id="lab-plan"></div><p id="plan-note" class="caption"></p><div id="lab-unit"></div></div></div><div class="lab-comparison" id="lab-comparison"></div><p class="caption">This experiment is a modern geometric explanation. It does not identify the dimensions, construction method or intended angle of a surviving monument. A larger seked means a gentler face; multiplying both dimensions by the same amount preserves it.</p></section>
<section id="words" aria-labelledby="words-title"><div class="section-heading"><p class="eyebrow">03 / What the words name</p></div><h2 id="words-title">Read a measure as well as a number.</h2><p class="measure">These consonantal transliterations follow the printed edition. They identify written words; they do not reconstruct ancient pronunciation. The modern name “seked” is a conventional reading of the technical term for the inward measure.</p><div class="word-grid">${words.map((w) => `<article><h3 lang="egy-Latn">${w.word}</h3><p><strong>${w.gloss}</strong></p><p>${w.note}</p><button type="button" class="text-button" data-word-source="${w.page}">Find it in problem ${w.problem}</button></article>`).join("")}</div></section>
<section id="evidence" aria-labelledby="source-title"><div class="section-heading"><p class="eyebrow">04 / Read the evidence</p></div><h2 id="source-title" tabindex="-1">Three ways of seeing the same marks.</h2><p class="measure">The 1929 edition places a copied hieratic text above a hieroglyphic transcription. Its facing page supplies transliteration and a literal translation. Two adjoining photographs show the papyrus itself. The plates run their transliteration right to left, reversing letters and digits; the facing translation reads left to right. A transcription is an editorial reading; a photograph is a different kind of evidence.</p><p class="caption manuscript-context">The British Museum dates this copy to about 1550 BCE, in Egypt’s Second Intermediate Period. The scribe Ahmose says he copied older writing. <a href="https://artsandculture.google.com/asset/rhind-mathematical-papyrus/qAGwXnGhBxLKTg?hl=en">Museum account of the manuscript</a>.</p><div id="source-choices" class="source-choices" role="group" aria-label="Printed evidence"></div><figure class="source-figure"><div id="scan-window" tabindex="0" role="region" aria-label="Complete source scan; scroll to read the page"></div><figcaption id="scan-caption"></figcaption></figure><div class="scan-controls"><button type="button" id="zoom" aria-pressed="false">Enlarge scan</button><a id="full-image">Open complete image</a><a id="library-link">Open the scanned book</a></div><p class="caption">Source: A. B. Chace, L. Bull and H. P. Manning, <cite>The Rhind Mathematical Papyrus</cite>, volume II (1929), plates 78–82 and facing literal translations, photographs XXI–XXII. Peet’s p. 100 (1923) is included for the explicit comparison of readings. The papyrus is held by the British Museum (<a href="https://www.britishmuseum.org/collection/object/Y_EA10057">10057</a> and <a href="https://www.britishmuseum.org/collection/object/Y_EA10058">10058</a>); these are historical edition images, not new museum photographs.</p></section>
<section class="limits"><h2>A calculation can be exact.<br>A reading can still be uncertain.</h2><p>These exercises survive in a copied manuscript. The editions make choices about technical terms, missing words and numerical slips. Seked retains those choices where they affect the geometry. It uses the face-slope interpretation adopted by Peet and Chace, rather than the older interpretation based on an edge and a base diagonal.</p><p>The shapes are mathematical sections. They supply neither a survey of an Egyptian building nor evidence that a particular building was designed from these exercises. Problem 60’s solid remains unidentified here.</p></section></main><footer><span>Seked · <a href="https://github.com/antonsoo/seked">Source & licenses</a></span><span id="offline" role="status">Preparing the offline reading…</span></footer>`;

function remember() {
  history.replaceState(null, "", `${location.pathname}${writeState(state)}${location.hash}`);
}
function updateLesson() {
  const problem = getProblem(state.problem),
    step = selectedStep(state),
    dim = lessonDimensions(state);
  get("reader-title").textContent = problem.title;
  get("question").textContent = problem.question;
  document.querySelectorAll<HTMLButtonElement>("[data-problem]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.problem === state.problem));
  });
  document.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.step) === state.step));
  });
  document.querySelectorAll<HTMLButtonElement>("[data-reading]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.reading === state.reading));
  });
  get("reading-switch").hidden = state.problem !== "59";
  get("read-peet").hidden = !["59", "59B"].includes(state.problem);
  get("lesson-section").innerHTML = sectionDrawing(
    dim,
    "face",
    step.emphasis,
    "lesson-section-svg",
    state.problem === "60" ? "SYMMETRICAL SECTION · SOLID UNDECIDED" : undefined,
  );
  get("lesson-unit").innerHTML = unitDrawing(dim, "face", "lesson-unit-svg");
  get("lesson-palms").textContent = `${mixed(slope(dim).palms)} palms`;
  get("lesson-caption").textContent =
    state.problem === "59"
      ? `${state.reading === "written" ? "Written statement" : "Dimensions implied by the working"}: ${dimensionsLabel(dim)}. The printed result is discussed separately.`
      : state.problem === "60"
        ? "A section using base measure 15 and height 30. Its shape does not decide which solid iwn names."
        : "A modern section at equal horizontal and vertical scales. Blue is vertical height; red is horizontal run.";
  get("step-position").textContent = `Problem ${problem.id} · Step ${state.step + 1} of 5`;
  get("step-title").textContent = step.title;
  get("step-text").textContent = step.text;
  get("step-equation").textContent = step.equation;
  get("observation").textContent = problem.observation;
  get("lesson-table").innerHTML = exactTable(dim);
  get<HTMLButtonElement>("previous").disabled = state.step === 0;
  get<HTMLButtonElement>("next").disabled = state.step === 4;
  renderChoices();
  renderReckoning();
  remember();
}
function renderReckoning() {
  const r = reckon(state.problem, state.rows);
  get("reckoning-title").textContent = `Reckon with ${mixed(r.input)} to find ${mixed(r.target)}.`;
  get("reckoning-note").textContent = r.note;
  get("reckoning-rows").innerHTML = r.choices
    .map(
      (f, i) =>
        `<tr><td><input type="checkbox" data-row="${i}" id="row-${i}" ${state.rows & (1 << i) ? "checked" : ""}><label for="row-${i}" class="sr-only">Include ${mixed(f)} times ${mixed(r.input)}</label></td><th>${mixed(f)}</th><td>${mixed(multiply(r.input, f))}</td></tr>`,
    )
    .join("");
  get("reckoning-sum").textContent =
    `${mixed(r.multiplier)} × ${mixed(r.input)} = ${mixed(r.total)}. ${r.matched ? "Target reached." : r.difference.n > 0n ? `${mixed(r.difference)} still needed.` : `${mixed({ n: -r.difference.n, d: r.difference.d })} above the target.`}`;
}
get("reckoning-rows").addEventListener("change", (event) => {
  const checkbox = event.target;
  if (!(checkbox instanceof HTMLInputElement)) return;
  const index = Number(checkbox.dataset.row);
  state = { ...state, rows: state.rows ^ (1 << index) };
  renderReckoning();
  get(`row-${index}`).focus();
  remember();
});
get("source-rows").addEventListener("click", () => {
  state = { ...state, rows: reckoning(state.problem).sourceMask };
  renderReckoning();
  remember();
});
get("clear-rows").addEventListener("click", () => {
  state = { ...state, rows: 0 };
  renderReckoning();
  remember();
});

function updateLab() {
  get<HTMLInputElement>("base").value = exact(state.lab.base);
  get<HTMLInputElement>("height").value = exact(state.lab.height);
  document.querySelectorAll<HTMLButtonElement>("[data-section]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.section === state.section));
  });
  get("lab-section").innerHTML = sectionDrawing(
    state.lab,
    state.section,
    "ratio",
    "lab-section-svg",
  );
  get("lab-unit").innerHTML = unitDrawing(state.lab, state.section, "lab-unit-svg");
  get("lab-plan").innerHTML = planDrawing(state.section);
  const g = sectionCoordinates(state.lab, state.section);
  const small = Math.min(g.run, g.height) * g.scale < 8;
  get("section-summary").textContent =
    `${state.section === "face" ? "Face" : "Edge"} inclination: ${degreeLabel(state.lab, state.section)} to the horizontal. Both dimensions share one drawing scale.${small ? " These proportions are too extreme to distinguish clearly at this size. Use the numerical inclination, or choose less extreme dimensions." : ""}`;
  get("plan-note").textContent =
    state.section === "face"
      ? "The red section crosses the midpoint of a base side. The horizontal half-section is one half of the base side."
      : "The red section crosses opposite corners. The horizontal half-section is one half of the base diagonal: √2 times longer than the face section’s run.";
  get("lab-comparison").innerHTML =
    `<table><thead><tr><th>Same pyramid</th><th>Face section</th><th>Corner section</th></tr></thead><tbody><tr><th>Inclination to horizontal</th><td>${degreeLabel(state.lab, "face")}</td><td>${degreeLabel(state.lab, "corner")}</td></tr><tr><th>Horizontal measure</th><td>half the base side</td><td>half the base diagonal</td></tr></tbody></table><p><strong>Face seked: ${mixed(slope(state.lab).palms)} palms</strong> (${decimalPalms(state.lab)} in decimal form) per vertical cubit. The corner drawing’s larger inward measure is not substituted for this face seked.</p>`;
  remember();
}
function renderChoices() {
  const p = getProblem(state.problem);
  const pages: Array<number | "peet"> = [
    p.literal,
    p.plate,
    36,
    37,
    ...(["59", "59B"].includes(state.problem) ? ["peet" as const] : []),
  ];
  if (!pages.includes(sourcePage)) pages.push(sourcePage);
  get("source-choices").innerHTML = pages
    .map(
      (n) =>
        `<button type="button" data-source="${n}" aria-pressed="${n === sourcePage}">${n === "peet" ? "Peet · p. 100" : sourceLabel(n)}</button>`,
    )
    .join("");
}
function drawSource() {
  const file =
    sourcePage === "peet" ? "peet-100.jpg" : `chace2-${String(sourcePage).padStart(3, "0")}.jpg`;
  const size = sourceHashes.find((s) => s.file === file);
  scanAnchor = null;
  get("scan-window").classList.remove("enlarged");
  get("zoom").setAttribute("aria-pressed", "false");
  get("zoom").textContent = "Enlarge scan";
  get("scan-window").innerHTML =
    `<img src="./sources/${file}" width="${size?.width}" height="${size?.height}" alt="${sourcePage === "peet" ? "Peet page 100" : sourceLabel(sourcePage)}: complete page" loading="lazy">`;
  get("scan-window").scrollTo(0, 0);
  get<HTMLAnchorElement>("full-image").href = `./sources/${file}`;
  get<HTMLAnchorElement>("library-link").href =
    sourcePage === "peet"
      ? "https://archive.org/details/Peet_1923/page/n103/mode/1up"
      : sourceURL(sourcePage);
  get("scan-caption").textContent = sourceCaption(sourcePage, state.problem);
  renderChoices();
}
async function jumpSource(page: number | "peet") {
  sourcePage = page;
  drawSource();
  const img = get("scan-window").querySelector("img");
  if (!img) return;
  scanAnchor = sourceFocus(page, state.problem);
  img.loading = "eager";
  get("source-title").focus();
  get("evidence").scrollIntoView();
  try {
    await img.decode();
    if (img !== get("scan-window").querySelector("img") || scanAnchor === null) return;
    get("scan-window").scrollTop = Math.max(
      0,
      img.clientHeight * scanAnchor.y - get("scan-window").clientHeight / 2,
    );
  } catch {
    get("scan-caption").textContent += " Image unavailable; use the book link or retry online.";
  }
}
get("zoom").addEventListener("click", () => {
  const frame = get("scan-window"),
    img = frame.querySelector("img");
  if (!img) return;
  const old = img.getBoundingClientRect(),
    box = frame.getBoundingClientRect(),
    fractionX = scanAnchor?.x ?? (box.left + frame.clientWidth / 2 - old.left) / old.width,
    fractionY = scanAnchor?.y ?? (box.top + frame.clientHeight / 2 - old.top) / old.height;
  scanAnchor = null;
  const enlarged = frame.classList.toggle("enlarged");
  const next = img.getBoundingClientRect();
  frame.scrollTo({
    left: frame.scrollLeft + next.left + fractionX * next.width - box.left - frame.clientWidth / 2,
    top: frame.scrollTop + next.top + fractionY * next.height - box.top - frame.clientHeight / 2,
  });
  get("zoom").textContent = enlarged ? "Fit scan to width" : "Enlarge scan";
  get("zoom").setAttribute("aria-pressed", String(enlarged));
});
for (const event of ["wheel", "pointerdown", "touchstart", "keydown"])
  get("scan-window").addEventListener(
    event,
    () => {
      scanAnchor = null;
    },
    { passive: true },
  );
document.addEventListener("click", (event) => {
  const b =
    event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button") : null;
  if (!b) return;
  if (b.dataset.problem) {
    state = { ...state, problem: b.dataset.problem as ProblemId, step: 0, rows: 0 };
    sourcePage = getProblem(state.problem).literal;
    updateLesson();
    drawSource();
  } else if (b.dataset.step) {
    state = { ...state, step: Number(b.dataset.step) };
    updateLesson();
  } else if (b.dataset.reading) {
    state = { ...state, reading: b.dataset.reading as Reading };
    updateLesson();
  } else if (b.dataset.section) {
    state = { ...state, section: b.dataset.section as Section };
    updateLab();
  } else if (b.dataset.source) {
    void jumpSource(b.dataset.source === "peet" ? "peet" : Number(b.dataset.source));
  } else if (b.dataset.wordSource) {
    void jumpSource(Number(b.dataset.wordSource));
  }
});
get("previous").addEventListener("click", () => {
  state = { ...state, step: Math.max(0, state.step - 1) };
  updateLesson();
});
get("next").addEventListener("click", () => {
  state = { ...state, step: Math.min(4, state.step + 1) };
  updateLesson();
});
get("read-literal").addEventListener(
  "click",
  () => void jumpSource(getProblem(state.problem).literal),
);
get("read-plate").addEventListener("click", () => void jumpSource(getProblem(state.problem).plate));
get("read-peet").addEventListener("click", () => void jumpSource("peet"));
get("dimensions-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const base = parseDimension(get<HTMLInputElement>("base").value),
    height = parseDimension(get<HTMLInputElement>("height").value);
  get("base").setAttribute("aria-invalid", String(!base));
  get("height").setAttribute("aria-invalid", String(!height));
  if (!base || !height) {
    get("dimension-error").textContent =
      "Enter two positive lengths from 1/100 to 500. Fractions need a nonzero denominator. The drawing still shows the last valid dimensions.";
    return;
  }
  state = { ...state, lab: { base, height } };
  get("dimension-error").textContent = "";
  updateLab();
});
get("use-lesson").addEventListener("click", () => {
  state = { ...state, lab: lessonDimensions(state) };
  get("dimension-error").textContent = "";
  for (const id of ["base", "height"]) get(id).removeAttribute("aria-invalid");
  updateLab();
});
get("share").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}${writeState(state)}#reader`;
  try {
    await navigator.clipboard.writeText(url);
    get("action-status").textContent =
      "Copied the problem, step, reading, selected rows and experiment dimensions.";
  } catch {
    const input = document.createElement("input");
    input.value = url;
    input.readOnly = true;
    input.setAttribute("aria-label", "Copy this reading link");
    get("action-status").replaceChildren(input);
    input.select();
  }
});
get("save").addEventListener("click", async () => {
  get("action-status").textContent =
    "Preparing the illustrated reading and its complete source pages…";
  try {
    await saveReading(state);
    get("action-status").textContent = "Saved. The illustrated reading opens without a connection.";
  } catch {
    get("action-status").textContent =
      "The source pages could not be verified. Reload online and try the download again.";
  }
});
get("csv").addEventListener("click", () => downloadCSV(state));
updateLesson();
updateLab();
drawSource();
void offlineStatus(get("offline"));
window.addEventListener("popstate", () => {
  state = readState(location.search);
  sourcePage = getProblem(state.problem).literal;
  updateLesson();
  updateLab();
  drawSource();
});
if (location.hash)
  void document.fonts.ready.then(() => {
    const id = location.hash.slice(1);
    if (["reader", "workshop", "evidence", "words"].includes(id))
      document.getElementById(id)?.scrollIntoView();
  });
