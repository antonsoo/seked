// biome-ignore-all lint/performance/useDomNodeTextContent: Review the actual visible reading.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const root = fileURLToPath(new URL("../", import.meta.url)),
  dist = path.join(root, "dist");
const output = path.resolve(process.argv[2] ?? "/tmp/seked-frustum");
await mkdir(output, { recursive: true });
const source = JSON.parse(await readFile(path.join(root, "src/frustum-sources.json"), "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function inventory(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await inventory(file)));
    else {
      const data = await readFile(file);
      result.push({ file: path.relative(dist, file), bytes: data.length, sha256: hash(data) });
    }
  }
  return result.sort((a, b) => a.file.localeCompare(b.file));
}
const report = {
  checkedAt: new Date().toISOString(),
  runtime: process.version,
  build: await inventory(dist),
  configurations: [],
  failures: [],
};
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".jpg": "image/jpeg",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
};
async function serve() {
  let fault = false;
  const server = createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, "http://localhost").pathname;
      if (!pathname.startsWith("/seked/")) {
        res.writeHead(404).end();
        return;
      }
      const relative =
        pathname === "/seked/" ? "index.html" : decodeURIComponent(pathname.slice(7));
      const file = path.resolve(dist, relative);
      if (!file.startsWith(`${dist}${path.sep}`)) {
        res.writeHead(404).end();
        return;
      }
      const bytes = await readFile(
        fault && relative === "sources/frustum/touraeff-100.jpg"
          ? path.join(dist, "sources/frustum/touraeff-102.jpg")
          : file,
      );
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    base: `http://127.0.0.1:${server.address().port}/seked/`,
    fault: () => {
      fault = true;
    },
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  };
}
async function download(page, selector, directory) {
  const [d] = await Promise.all([page.waitForEvent("download"), page.locator(selector).click()]);
  const target = path.join(directory, d.suggestedFilename());
  await d.saveAs(target);
  const bytes = await readFile(target);
  return {
    name: d.suggestedFilename(),
    bytes: bytes.length,
    sha256: hash(bytes),
    path: target,
    data: bytes,
  };
}
async function geometry(page, records, dimensions) {
  const values = await page.evaluate(() => {
    const svg = document.querySelector("#section-drawing svg"),
      cut = svg.querySelector(".section-cut"),
      matrix = svg.getScreenCTM();
    return {
      total: document.querySelector("[data-total]").dataset.total,
      cut: Number(document.querySelector("#cut-height").value),
      slice: {
        side: svg.dataset.sliceSide,
        area: svg.dataset.sliceArea,
        height: svg.dataset.sliceHeight,
        scale: Number(svg.dataset.scale),
        x1: Number(cut.dataset.x1),
        x2: Number(cut.dataset.x2),
        z: Number(cut.dataset.z),
        path: cut
          .getAttribute("d")
          .match(/-?\d+(?:\.\d+)?/g)
          .map(Number),
        screenScale: [matrix.a, matrix.d],
      },
    };
  });
  records.push({ dimensions, ...values });
}
function checkReading(bytes) {
  const html = bytes.toString();
  assert(!/<script[\s>]/i.test(html));
  for (const image of source.images) {
    const images = [...html.matchAll(/src="data:image\/jpeg;base64,([^"\s]+)"/g)].map((m) =>
      Buffer.from(m[1], "base64"),
    );
    assert(
      images.some((b) => hash(b) === image.sha256),
      `Missing exact original ${image.file}`,
    );
  }
  assert.match(html, /duplicate 4, which gives 8/);
  assert.match(html, /The pyramid volume theorem/);
  assert.match(html, /SIL OPEN FONT LICENSE|SIL Open Font License/);
  assert.match(html, /Public|public domain/);
  assert(
    !/(?:src|href)="(?:https?:)?\/\//i.test(html.replace(/<a\b[^>]*>/gi, "")),
    "No remote rendering assets",
  );
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const server = await serve(),
        base = server.base,
        directory = path.join(output, `${name}-${width}`);
      await mkdir(directory, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height: 1050 },
        acceptDownloads: true,
      });
      if (name === "chromium")
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      const page = await context.newPage(),
        errors = [],
        external = [],
        records = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("request", (r) => {
        if (/^https?:/.test(r.url()) && !r.url().startsWith(base)) external.push(r.url());
      });
      const config = { browser: name, width, geometry: records, downloads: [] };
      try {
        await page.goto(`${base}frustum.html#pieces`);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(
          () => document.querySelector("#offline").textContent === "Reading & source saved offline",
        );
        await page.locator("#source-window img").waitFor();
        assert.equal(await page.locator("[data-total]").getAttribute("data-total"), "56");
        await geometry(page, records, ["4", "2", "6"]);
        const drawingScale = await page.locator("#solid-drawing svg").getAttribute("data-scale");
        await page.locator("#spread").focus();
        await page.keyboard.press("End");
        assert.equal(await page.locator("#spread").inputValue(), "100");
        assert.equal(
          await page.locator("#solid-drawing [data-spread]").getAttribute("data-spread"),
          "100",
        );
        assert.equal(
          await page.locator("#solid-drawing svg").getAttribute("data-scale"),
          drawingScale,
        );
        await page.locator("#view-turn").focus();
        await page.keyboard.press("End");
        assert.equal(
          await page.locator("#solid-drawing svg").getAttribute("data-scale"),
          drawingScale,
        );
        await page.locator("#view-turn").focus();
        await page.keyboard.press("Home");
        await page.locator("[data-part=corners]").click();
        assert.equal(await page.locator("#solid-drawing polygon.corners.faded").count(), 0);
        assert((await page.locator("#solid-drawing polygon.wedges.faded").count()) > 0);
        await page.locator("[data-part=all]").click();
        await page.locator("#separate").click();
        await page.screenshot({ path: path.join(directory, "pieces.png") });
        await page.locator("#assemble").click();
        await page.locator("#cut-height").focus();
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#cut-height").inputValue(), "1");
        await geometry(page, records, ["4", "2", "6"]);
        await page.locator("#cut-height").focus();
        await page.keyboard.press("End");
        await geometry(page, records, ["4", "2", "6"]);
        for (const [preset, total, dimensions] of [
          ["other", "74", ["4", "3", "6"]],
          ["prism", "96", ["4", "4", "6"]],
          ["pyramid", "32", ["4", "0", "6"]],
        ]) {
          await page.locator(`[data-preset=${preset}]`).click();
          assert.equal(await page.locator("[data-total]").getAttribute("data-total"), total);
          await geometry(page, records, dimensions);
        }
        assert.equal(await page.locator("#solid-drawing polygon.wedges").count(), 0);
        for (const dimensions of [
          ["1/100", "0", "500"],
          ["500", "499999/1000", "1/100"],
          ["123457/997", "65431/999", "123/997"],
        ]) {
          await page.locator("#lower-side").fill(dimensions[0]);
          await page.locator("#upper-side").fill(dimensions[1]);
          await page.locator("#solid-height").fill(dimensions[2]);
          await page.locator("#dimension-form button").click();
          await page.locator("#cut-height").focus();
          await page.keyboard.press("Home");
          await page.keyboard.press("ArrowRight");
          await geometry(page, records, dimensions);
          assert(
            (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1,
            "Extreme input overflow",
          );
          assert(!/NaN|Infinity/.test(await page.locator("#solid-drawing").innerHTML()));
        }
        await page.locator("#lower-side").fill("7/2");
        await page.locator("#upper-side").fill("1 1/3");
        await page.locator("#solid-height").fill("9/4");
        await page.locator("#dimension-form button").click();
        await geometry(page, records, ["7/2", "4/3", "9/4"]);
        const beforeInvalid = await page.locator("[data-total]").getAttribute("data-total");
        await page.locator("#upper-side").fill("8");
        await page.locator("#dimension-form button").click();
        assert.match(await page.locator("#dimension-error").textContent(), /cannot be wider/);
        assert.equal(await page.locator("[data-total]").getAttribute("data-total"), beforeInvalid);
        await page.locator("[data-preset=papyrus]").click();
        await page.locator("[data-step='1']").click();
        assert.match(
          await page.locator("#reading-text").textContent(),
          /duplicate 4, which gives 8/,
        );
        await page.locator("[data-preset=other]").click();
        assert.match(await page.locator("#reading-text").textContent(), /2 × 4 = 8/);
        await page.goBack();
        assert.equal(await page.locator("[data-total]").getAttribute("data-total"), "56");
        await page.locator("#inspect-translation").click();
        assert.equal(new URL(page.url()).hash, "#sources");
        assert.equal(await page.locator(":focus").getAttribute("id"), "sources-title");
        await page.locator("#enlarge-source").click();
        await page.locator("#source-window").focus();
        await page.keyboard.press("PageDown");
        await page.waitForFunction(() => document.querySelector("#source-window").scrollTop > 0);
        for (const image of source.images) {
          await page.locator(`[data-page='${image.page}']`).click();
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
        await page.locator("#enlarge-source").click();
        await page.getByRole("link", { name: "Pyramid slopes", exact: true }).click();
        await page.locator("#reader-title").waitFor();
        await page.goBack();
        await page.locator("#source-window img").waitFor();
        const restoredSource = await page
          .locator("#source-window img")
          .evaluate(async (img) =>
            Array.from(new Uint8Array(await (await fetch(img.src)).arrayBuffer())),
          );
        assert.equal(
          hash(Buffer.from(restoredSource)),
          source.images.find((img) => img.page === 102).sha256,
        );
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        );
        assert(overflow <= 1, `Horizontal overflow: ${overflow}`);
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(
          axe.violations,
          [],
          JSON.stringify(
            axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
          ),
        );
        config.axeViolations = axe.violations.length;
        await page.locator("#separate").click();
        const json = await download(page, "#save-json", directory);
        config.downloads.push({ ...json, path: path.relative(output, json.path), data: undefined });
        const saved = JSON.parse(json.data);
        assert.equal(saved.dimensions.upperSide, "2");
        await page.locator("[data-preset=prism]").click();
        await page.locator("#open-settings").setInputFiles(json.path);
        await page.waitForFunction(
          () => document.querySelector("[data-total]").dataset.total === "56",
        );
        assert.equal(await page.locator("#spread").inputValue(), "80");
        await page.locator("#open-settings").setInputFiles({
          name: "broken.json",
          mimeType: "application/json",
          buffer: Buffer.from('{"format":"seked-frustum"}'),
        });
        assert.match(await page.locator("#export-status").textContent(), /version 1/);
        assert.equal(await page.locator("[data-total]").getAttribute("data-total"), "56");
        for (const [selector, label] of [
          ["#save-csv", "csv"],
          ["#save-svg", "svg"],
          ["#save-reading", "html"],
        ]) {
          const file = await download(page, selector, directory);
          config.downloads.push({
            ...file,
            path: path.relative(output, file.path),
            data: undefined,
          });
          if (label === "csv")
            assert.match(file.data.toString(), /"experiment","total","56","volume"/);
          if (label === "svg")
            assert.match(file.data.toString(), /<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/);
          if (label === "html") checkReading(file.data);
        }
        await page.locator("#share").click();
        assert.match(await page.locator("#share-link").inputValue(), /spread=80/);
        const shared = await page.locator("#share-link").inputValue();
        const tab = await context.newPage();
        await tab.goto(shared);
        await tab.locator("#solid-drawing svg").waitFor();
        assert.equal(await tab.locator("#spread").inputValue(), "80");
        await tab.close();
        const standalone = await context.newPage(),
          standaloneRequests = [];
        standalone.on("request", (r) => {
          if (/^https?:/.test(r.url())) standaloneRequests.push(r.url());
        });
        await standalone.goto(
          pathToFileURL(path.join(directory, "seked-frustum-reading.html")).href,
        );
        await standalone.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].map((i) => i.decode()));
        });
        assert.deepEqual(standaloneRequests, []);
        assert.equal(await standalone.locator(".source-page img").count(), 3);
        await standalone.screenshot({ path: path.join(directory, "saved-reading.png") });
        if (name === "chromium" && width === 1440)
          await standalone.pdf({
            path: path.join(directory, "reading.pdf"),
            printBackground: true,
            preferCSSPageSize: true,
          });
        await standalone.close();
        const inventory = await page.evaluate(async () => {
          const names = await caches.keys();
          const cache = await caches.open(names.find((n) => n.startsWith("seked-")));
          return (await cache.keys()).map((r) => new URL(r.url).pathname).sort();
        });
        assert(
          inventory.includes("/seked/index.html") && inventory.includes("/seked/frustum.html"),
        );
        for (const image of source.images)
          assert(inventory.includes(`/seked/sources/frustum/${image.file}`));
        config.cachedFiles = inventory;
        await context.setOffline(true);
        await server.close();
        await page.goto(`${base}?p=59&reading=working#reader`);
        await page.locator("#app").waitFor();
        assert.equal(
          await page.locator('[data-problem="59"]').getAttribute("aria-pressed"),
          "true",
        );
        await page.getByRole("link", { name: "A pyramid without its point", exact: true }).click();
        await page.locator("#solid-drawing svg").waitFor();
        await page.locator("[data-preset=other]").click();
        assert.equal(await page.locator("[data-total]").getAttribute("data-total"), "74");
        await page.reload();
        assert.equal(await page.locator("[data-total]").getAttribute("data-total"), "74");
        await page.locator("[data-page='100']").click();
        await page.locator("#source-window img").waitFor();
        const offlineDirectory = path.join(directory, "offline");
        await mkdir(offlineDirectory, { recursive: true });
        const offlineFile = await download(page, "#save-reading", offlineDirectory);
        checkReading(offlineFile.data);
        // The offline export has different dimensions and its own retained file.
        config.offline = {
          originStopped: true,
          reloadedVolume: "74",
          readingBytes: offlineFile.bytes,
          sha256: offlineFile.sha256,
        };
        assert.deepEqual(errors, []);
        assert.deepEqual(external, []);
        config.pageErrors = errors;
        config.externalRequests = external;
        report.configurations.push(config);
        console.log(
          `${name} ${width}: controls, actual files, sources, standalone reading and stopped-origin offline workflow passed.`,
        );
      } finally {
        await context.close();
        await server.close();
      }
    }
    // A same-status JPEG response is not acceptable source evidence.
    const server = await serve();
    server.fault();
    const context = await browser.newContext();
    const page = await context.newPage();
    let downloads = 0;
    page.on("download", () => downloads++);
    try {
      await page.goto(`${server.base}frustum.html?source=100#sources`);
      await page.waitForFunction(() =>
        document.querySelector("#source-window").textContent.includes("does not match"),
      );
      await page.locator("#save-reading").click();
      await page.waitForFunction(() =>
        document.querySelector("#export-status").textContent.includes("does not match"),
      );
      await page.waitForFunction(() =>
        /unavailable|incomplete/.test(document.querySelector("#offline").textContent),
      );
      assert.equal(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), false);
      assert.equal(downloads, 0);
      assert.equal(await page.locator("#source-window img").count(), 0);
      report.failures.push({
        browser: name,
        substitutedJPEGRejected: true,
        completeWorkerInstallRejected: true,
        downloadPrevented: true,
      });
    } finally {
      await context.close();
      await server.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(output, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Saved review to ${output}`);
