// biome-ignore-all lint/performance/useDomNodeTextContent: Review what the reader sees.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4371/seked/";
const output = path.resolve(process.argv[3] ?? "/tmp/seked-browser");
await mkdir(output, { recursive: true });
const root = fileURLToPath(new URL("../", import.meta.url));
const hashes = JSON.parse(await readFile(path.join(root, "src/source-hashes.json"), "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const report = { checkedAt: new Date().toISOString(), base, configurations: [] };
const rendered = [];
const sourceReadings = [
  ["56", "written", "5 1/25"],
  ["57", "written", "5 1/4"],
  ["58", "written", "5 1/4"],
  ["59", "written", "2 1/3"],
  ["59", "working", "5 1/4"],
  ["59B", "written", "5 1/4"],
  ["60", "written", "1 3/4"],
];
async function capture(page, scope, meta) {
  const result = await page.evaluate((scope) => {
    const svg = document.querySelector(`#${scope}-section svg`);
    const unit = document.querySelector(`#${scope}-unit svg`);
    const points = (el) =>
      Object.fromEntries(
        [...el.querySelectorAll("circle[data-point]")].map((p) => [
          p.dataset.point,
          [p.cx.baseVal.value, p.cy.baseVal.value],
        ]),
      );
    const m = svg.getScreenCTM();
    return {
      kind: svg.dataset.kind,
      scale: Number(svg.dataset.scale),
      points: points(svg),
      unit: points(unit),
      screenScale: [m.a, m.d],
    };
  }, scope);
  rendered.push({ scope, ...meta, ...result });
}
async function getDownload(page, selector) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator(selector).click(),
  ]);
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  return { name: download.suggestedFilename(), bytes: Buffer.concat(chunks) };
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      if (name === "chromium")
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      const page = await context.newPage();
      const errors = [],
        external = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("request", (r) => {
        if (!r.url().startsWith(base) && !r.url().startsWith("blob:")) external.push(r.url());
      });
      const response = await page.goto(`${base}?p=59&step=3#reader`);
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(
        () => document.querySelector("#offline").textContent === "Reading & source saved offline",
      );
      // First source visit has not predecoded the lazy image.
      await page.locator("#read-literal").click();
      await page.locator("#scan-window img").evaluate((img) => img.decode());
      await page.locator("#zoom").click();
      const sourceCenter = await page
        .locator("#scan-window")
        .evaluate(
          (el) => (el.scrollTop + el.clientHeight / 2) / el.querySelector("img").clientHeight,
        );
      assert(
        Math.abs(sourceCenter - 0.43) < 0.005,
        `${name} ${width} source center ${sourceCenter}`,
      );
      await page.locator("#zoom").click();
      const sourcesSeen = new Set();
      let steps = 0;
      for (const [p, reading, palms] of sourceReadings) {
        await page.locator(`[data-problem="${p}"]`).click();
        if (p === "59") await page.locator(`[data-reading="${reading}"]`).click();
        assert.equal(await page.locator("#lesson-palms").innerText(), `${palms} palms`);
        for (let step = 0; step < 5; step++) {
          await page.locator(`[data-step="${step}"]`).click();
          assert.match(
            await page.locator("#step-position").innerText(),
            new RegExp(`Step ${step + 1} of 5`, "i"),
          );
          assert((await page.locator("#step-text").innerText()).length > 50);
          await capture(page, "lesson", { browser: name, width, p, reading, step });
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          steps++;
        }
        await page.locator("#source-rows").click();
        assert.match(await page.locator("#reckoning-sum").innerText(), /Target reached/);
        await page.locator("#clear-rows").click();
        await page.locator("#row-0").focus();
        await page.keyboard.press("Space");
        assert.equal(await page.locator("#row-0").isChecked(), true);
        assert.equal(
          await page.locator("#row-0").evaluate((e) => e === document.activeElement),
          true,
        );
        assert.doesNotMatch(await page.locator("#reckoning-sum").innerText(), /Target reached/);
        if (p === "58") assert.match(await page.locator("#reckoning-rows").innerText(), /46 2\/3/);
        for (const selector of [
          "#read-literal",
          "#read-plate",
          ...(["59", "59B"].includes(p) ? ["#read-peet"] : []),
        ]) {
          await page.locator(selector).click();
          await page.locator("#scan-window img").evaluate((img) => img.decode());
          const file = await page.locator("#scan-window img").getAttribute("src");
          sourcesSeen.add(file.split("/").at(-1));
          assert.equal(await page.locator("#source-choices [aria-pressed=true]").count(), 1);
        }
      }
      for (const n of [36, 37]) {
        await page.locator(`[data-source="${n}"]`).click();
        await page.locator("#scan-window img").evaluate((img) => img.decode());
        sourcesSeen.add(
          (await page.locator("#scan-window img").getAttribute("src")).split("/").at(-1),
        );
      }
      assert.equal(sourcesSeen.size, 13);
      await page.locator('[data-problem="59B"]').click();
      await page.locator('[data-source="37"]').click();
      await page.locator("#scan-window img").evaluate((img) => img.decode());
      await page.locator("#zoom").click();
      const photoPosition = await page.locator("#scan-window").evaluate((el) => ({
        x: (el.scrollLeft + el.clientWidth / 2) / el.querySelector("img").clientWidth,
        y: (el.scrollTop + el.clientHeight / 2) / el.querySelector("img").clientHeight,
      }));
      assert(Math.abs(photoPosition.x - 0.43) < 0.002);
      assert(Math.abs(photoPosition.y - 0.56) < 0.002);
      assert.match(await page.locator("#scan-caption").innerText(), /59B is written separately/);
      await page
        .locator("#scan-window")
        .screenshot({ path: path.join(output, `${name}-${width}-photograph.png`) });
      // A vocabulary link keeps its own evidence selected even under another problem.
      await page.locator('[data-word-source="203"]').first().click();
      assert.equal(await page.locator('[data-source="203"]').getAttribute("aria-pressed"), "true");
      const labCases = [
        ["12", "8"],
        ["140", "93 1/3"],
        ["360", "250"],
        ["15", "30"],
        ["0.01", "500"],
        ["500", "0.01"],
        ["7/4", "1/3"],
        ["36", "24"],
      ];
      for (const [baseInput, heightInput] of labCases) {
        await page.locator("#base").fill(baseInput);
        await page.locator("#height").fill(heightInput);
        await page.locator("#height").press("Enter");
        assert.equal(await page.locator("#dimension-error").innerText(), "");
        const b = await page.locator("#base").inputValue(),
          h = await page.locator("#height").inputValue();
        for (const kind of ["face", "corner"]) {
          await page.locator(`[data-section="${kind}"]`).click();
          await capture(page, "lab", { browser: name, width, base: b, height: h });
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        }
      }
      const before = await page.locator("#lab-section").innerHTML();
      await page.locator("#height").fill("1/0");
      await page.locator("#height").press("Enter");
      assert.equal(await page.locator("#lab-section").innerHTML(), before);
      assert.match(await page.locator("#dimension-error").innerText(), /last valid/);
      await page.locator('[data-problem="59"]').click();
      await page.locator('[data-reading="working"]').click();
      await page.locator('[data-step="3"]').click();
      await page.locator("#source-rows").click();
      await page.locator("#use-lesson").click();
      await page.locator('[data-section="corner"]').click();
      // Native copy and paste; no clipboard shim.
      await page.locator("#share").click();
      await page.waitForFunction(
        () =>
          /Copied/.test(document.querySelector("#action-status").textContent) ||
          document.querySelector("#action-status input"),
      );
      const fallback = page.getByRole("textbox", { name: "Copy this reading link" });
      const nativeClipboard = !(await fallback.count());
      let shared;
      if (await fallback.count()) shared = await fallback.inputValue();
      else if (name === "chromium")
        shared = await page.evaluate(() => navigator.clipboard.readText());
      else {
        await page.locator("#base").focus();
        await page.locator("#base").press("Control+A");
        await page.locator("#base").press("Control+V");
        shared = await page.locator("#base").inputValue();
      }
      assert.equal(new URL(shared).searchParams.get("rows"), "3");
      assert.equal(new URL(shared).searchParams.get("reading"), "working");
      await page.goto(shared);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("#lesson-palms").innerText(), "5 1/4 palms");
      assert.match(await page.locator("#reckoning-sum").innerText(), /Target reached/);
      assert.equal(
        await page.locator('[data-section="corner"]').getAttribute("aria-pressed"),
        "true",
      );
      await page.locator("#reader-title").focus();
      await page
        .locator(".reading-desk")
        .screenshot({ path: path.join(output, `${name}-${width}-reading.png`) });
      await page
        .locator(".reckoning")
        .screenshot({ path: path.join(output, `${name}-${width}-reckoning.png`) });
      await page
        .locator("#workshop")
        .screenshot({ path: path.join(output, `${name}-${width}-experiment.png`) });
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        [],
      );
      const csv = await getDownload(page, "#csv");
      assert.match(csv.bytes.toString(), /reading,59,working,12,8,6,3\/4,21\/4,21,4\/3/);
      const saved = await getDownload(page, "#save");
      const html = saved.bytes.toString();
      assert.match(html, /worked: 21\/4; printed result: 11\/2 palms/);
      assert.match(html, /1\/2 \+ 1\/4: multiplier 3\/4/);
      const embedded = [...html.matchAll(/data:image\/jpeg;base64,([^"\s]+)/g)].map((m) =>
        Buffer.from(m[1], "base64"),
      );
      const expected = hashes.filter((s) =>
        [
          "chace2-209.jpg",
          "chace2-210.jpg",
          "chace2-036.jpg",
          "chace2-037.jpg",
          "peet-100.jpg",
        ].includes(s.file),
      );
      assert.deepEqual(embedded.map(hash).sort(), expected.map((s) => s.sha256).sort());
      await writeFile(path.join(output, `${name}-${width}-reading.html`), saved.bytes);
      await writeFile(path.join(output, `${name}-${width}-quantities.csv`), csv.bytes);
      const standalone = await context.newPage(),
        standaloneRequests = [];
      standalone.on("request", (r) => {
        if (/^https?:/.test(r.url())) standaloneRequests.push(r.url());
      });
      await standalone.goto(pathToFileURL(path.join(output, `${name}-${width}-reading.html`)).href);
      await standalone
        .locator(".sources img")
        .evaluateAll((imgs) => Promise.all(imgs.map((img) => img.decode())));
      assert(await standalone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (name === "chromium" && width === 1440)
        await standalone.pdf({
          path: path.join(output, "reading.pdf"),
          printBackground: true,
          preferCSSPageSize: true,
        });
      assert.deepEqual(standaloneRequests, []);
      await standalone.close();
      await context.setOffline(true);
      await page.reload();
      await page.waitForFunction(
        () => document.querySelector("#offline").textContent === "Reading & source saved offline",
      );
      assert.equal(await page.locator("#lesson-palms").innerText(), "5 1/4 palms");
      const cached = await page.evaluate(
        async (files) =>
          Promise.all(
            files.map(async (file) => {
              const data = await (await fetch(`./sources/${file}`)).arrayBuffer();
              return [...new Uint8Array(await crypto.subtle.digest("SHA-256", data))]
                .map((x) => x.toString(16).padStart(2, "0"))
                .join("");
            }),
          ),
        hashes.map((s) => s.file),
      );
      assert.deepEqual(
        cached,
        hashes.map((s) => s.sha256),
      );
      const offlineReading = await getDownload(page, "#save");
      assert.deepEqual(offlineReading.bytes, saved.bytes);
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
      report.configurations.push({
        browser: name,
        version: browser.version(),
        width,
        steps,
        sourceCenter,
        photograph59BPosition: photoPosition,
        sourceImages: sourcesSeen.size,
        labCases: labCases.length * 2,
        nativeClipboard,
        savedReadingSha256: hash(saved.bytes),
        csv: csv.bytes.toString(),
        embeddedSourceHashes: embedded.map(hash),
        sourceHashesOffline: cached,
        offlineReadingIdentical: true,
        accessibilityViolations: axe.violations.length,
        pageErrors: errors,
        externalRequests: external,
      });
      await context.close();
      console.log(
        `${name} ${width}: ${steps} source steps, ${labCases.length * 2} section views, 13 scans, saved and offline readings passed`,
      );
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(output, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(output, "rendered.json"), `${JSON.stringify(rendered, null, 2)}\n`);
