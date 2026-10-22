import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const directory = path.resolve(process.argv[2] ?? "dist");
const output = path.resolve(process.argv[3] ?? "/tmp/seked-offline.json");
const target = "/seked/sources/chace2-203.jpg";
let fault = "none",
  release,
  held = false,
  rejected = 0;
let gate = Promise.resolve();
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".jpg": "image/jpeg",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
};
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (!pathname.startsWith("/seked/")) {
      response.writeHead(404).end();
      return;
    }
    if (pathname === target && fault === "hold") {
      held = true;
      await gate;
    }
    if (pathname === target && fault === "substitute") rejected++;
    const relative = pathname === "/seked/" ? "index.html" : pathname.slice(7);
    const file = path.resolve(directory, relative);
    if (!file.startsWith(`${directory}${path.sep}`)) {
      response.writeHead(404).end();
      return;
    }
    const bytes = await readFile(
      pathname === target && fault === "substitute"
        ? path.join(directory, "sources/chace2-205.jpg")
        : file,
    );
    response.writeHead(200, {
      "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/seked/`;
const report = { checkedAt: new Date().toISOString(), cases: [] };
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    const browser = await engine.launch();
    try {
      for (const scenario of ["hold", "substitute"]) {
        fault = scenario;
        held = false;
        rejected = 0;
        gate = new Promise((resolve) => {
          release = resolve;
        });
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(base);
        if (scenario === "hold") {
          const started = Date.now();
          await page.waitForTimeout(8500);
          assert(held, "The install must have requested the held source");
          const pending = await page.locator("#offline").textContent();
          assert.match(pending, /Downloading/);
          assert.doesNotMatch(pending, /saved offline/);
          const waitMs = Date.now() - started;
          fault = "none";
          release();
          await page.waitForFunction(
            () =>
              document.querySelector("#offline").textContent === "Reading & source saved offline",
          );
          report.cases.push({
            browser: name,
            scenario,
            heldMs: waitMs,
            pendingStatus: pending,
            eventuallyComplete: true,
          });
        } else {
          await page.waitForFunction(() =>
            /unavailable|incomplete/.test(document.querySelector("#offline").textContent),
          );
          const failedStatus = await page.locator("#offline").textContent();
          assert(rejected > 0);
          assert.equal(
            await page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
            false,
          );
          let downloads = 0;
          page.on("download", () => {
            downloads++;
          });
          await page.locator("#save").click();
          await page.waitForFunction(() =>
            /could not be verified/.test(document.querySelector("#action-status").textContent),
          );
          assert.equal(downloads, 0, "A substituted source must not become a reading download");
          const exportFailure = await page.locator("#action-status").textContent();
          fault = "none";
          await page.reload();
          await page.waitForFunction(
            () =>
              document.querySelector("#offline").textContent === "Reading & source saved offline",
          );
          report.cases.push({
            browser: name,
            scenario,
            failedStatus,
            exportFailure,
            refusedDownload: true,
            repaired: true,
          });
        }
        await context.setOffline(true);
        await page.reload();
        await page.waitForFunction(
          () => document.querySelector("#offline").textContent === "Reading & source saved offline",
        );
        await page.locator('[data-problem="60"]').click();
        assert.equal(await page.locator("#lesson-palms").textContent(), "1 3/4 palms");
        report.cases.at(-1).offlineRepairedReading = true;
        console.log(`${name}: ${scenario} installation and offline recovery passed`);
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  release?.();
  await new Promise((resolve) => server.close(resolve));
}
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
