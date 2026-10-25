// biome-ignore-all lint/performance/useDomNodeTextContent: Check the public rendered reading.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, firefox } from "playwright";

const base = "https://antonsoo.github.io/seked/",
  output = path.resolve(process.argv[2] ?? "/tmp/seked-frustum-hosted");
await mkdir(output, { recursive: true });
const source = JSON.parse(await readFile("src/frustum-sources.json", "utf8"));
const build = JSON.parse(await readFile("docs/frustum-review/build-identity.json", "utf8"));
const edition = (await readFile("dist/sw.js", "utf8")).match(/const EDITION = "([a-f0-9]+)"/)[1];
const hash = (b) => createHash("sha256").update(b).digest("hex");
const report = {
  checkedAt: new Date().toISOString(),
  base,
  expectedEdition: edition,
  configurations: [],
};
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
      const page = await context.newPage(),
        errors = [],
        downloads = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const directory = path.join(output, `${name}-${width}`);
      await mkdir(directory, { recursive: true });
      try {
        const response = await page.goto(
          `${base}frustum.html?a=4&b=2&h=6&spread=80&cut=50&turn=35&part=all&step=1&source=100#pieces`,
        );
        assert.equal(response.status(), 200);
        await page.locator("#source-window img").waitFor();
        await page.waitForFunction(
          () => document.querySelector("#offline").textContent === "Reading & source saved offline",
        );
        assert.equal(await page.locator("[data-total]").getAttribute("data-total"), "56");
        assert.match(
          await page.locator("#reading-text").textContent(),
          /duplicate 4, which gives 8/,
        );
        await page.locator("#spread").focus();
        await page.keyboard.press("Home");
        assert.equal(await page.locator("#solid-drawing svg").getAttribute("data-spread"), "0");
        await page.locator("#separate").click();
        await page.locator("[data-preset=other]").click();
        assert.equal(await page.locator("[data-total]").getAttribute("data-total"), "74");
        assert.match(await page.locator("#reading-text").textContent(), /2 × 4 = 8/);
        await page.goBack();
        assert.equal(await page.locator("[data-total]").getAttribute("data-total"), "56");
        for (const image of source.images) {
          await page.locator(`[data-page="${image.page}"]`).click();
          await page.waitForFunction(
            (p) => document.querySelector("#source-window img")?.alt.includes(`page ${p}:`),
            image.page,
          );
          const bytes = await page
            .locator("#source-window img")
            .evaluate(async (img) =>
              Array.from(new Uint8Array(await (await fetch(img.src)).arrayBuffer())),
            );
          assert.equal(hash(Buffer.from(bytes)), image.sha256);
        }
        for (const selector of ["#save-json", "#save-csv", "#save-svg", "#save-reading"]) {
          const [d] = await Promise.all([
            page.waitForEvent("download"),
            page.locator(selector).click(),
          ]);
          const target = path.join(directory, d.suggestedFilename());
          await d.saveAs(target);
          const bytes = await readFile(target);
          downloads.push({ file: d.suggestedFilename(), bytes: bytes.length, sha256: hash(bytes) });
          if (selector === "#save-reading") {
            const text = bytes.toString();
            assert(!/<script[\s>]/i.test(text));
            assert(!text.includes("dissection below"));
            for (const img of source.images)
              assert(
                [...text.matchAll(/src="data:image\/jpeg;base64,([^"\s]+)"/g)].some(
                  (m) => hash(Buffer.from(m[1], "base64")) === img.sha256,
                ),
              );
            const saved = await context.newPage(),
              requests = [];
            saved.on("request", (r) => {
              if (/^https?:/.test(r.url())) requests.push(r.url());
            });
            await saved.goto(pathToFileURL(target).href);
            await saved.evaluate(async () => {
              await document.fonts.ready;
              await Promise.all([...document.images].map((i) => i.decode()));
            });
            assert.deepEqual(requests, []);
            assert.equal(await saved.locator(".source-page img").count(), 3);
            await saved.close();
          }
        }
        const cache = await page.evaluate(async () => {
          const names = await caches.keys(),
            key = names.find((n) => n.startsWith("seked-")),
            cache = await caches.open(key);
          return { key, files: (await cache.keys()).map((r) => new URL(r.url).pathname).sort() };
        });
        assert.equal(cache.key, `seked-${edition}`);
        assert.deepEqual(
          cache.files,
          build.files
            .filter((f) => f.file !== "sw.js")
            .map((f) => `/seked/${f.file}`)
            .sort(),
        );
        assert((await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1);
        await context.setOffline(true);
        await page.goto(base);
        await page.locator("[data-problem='59']").click();
        await page.getByRole("link", { name: "A pyramid without its point", exact: true }).click();
        await page.locator("[data-preset=other]").click();
        await page.reload();
        assert.equal(await page.locator("[data-total]").getAttribute("data-total"), "74");
        await page.locator('[data-page="100"]').click();
        await page.locator("#source-window img").waitFor();
        assert.deepEqual(errors, []);
        report.configurations.push({
          browser: name,
          version: browser.version(),
          width,
          downloads,
          currentCache: cache.key,
          cachedFiles: cache.files.length,
          offlineNavigationAndReload: true,
          pageErrors: errors,
        });
        console.log(
          `${name} ${width}: public controls, exact source images, native files and current-edition offline reload passed.`,
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(output, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
