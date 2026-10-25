import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const previous = process.argv[2];
if (!previous) throw new Error("Pass the built one-room dist directory as the first argument.");
const oldDist = path.resolve(previous),
  current = path.resolve("dist"),
  output = path.resolve(process.argv[3] ?? "/tmp/seked-frustum-upgrade.json");
const edition = async (directory) =>
  (await readFile(path.join(directory, "sw.js"), "utf8")).match(/const EDITION = "([a-f0-9]+)"/)[1];
const oldEdition = await edition(oldDist),
  newEdition = await edition(current);
assert.notEqual(oldEdition, newEdition);
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".jpg": "image/jpeg",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
};
const report = { checkedAt: new Date().toISOString(), oldEdition, newEdition, cases: [] };
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const scenario of ["held-new-source", "substituted-new-source"]) {
      let directory = oldDist,
        mode = "normal",
        held = false,
        release;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      const server = createServer(async (req, res) => {
        try {
          const pathname = new URL(req.url, "http://localhost").pathname;
          if (!pathname.startsWith("/seked/")) {
            res.writeHead(404).end();
            return;
          }
          const relative = pathname === "/seked/" ? "index.html" : pathname.slice(7);
          const target = relative === "sources/frustum/touraeff-100.jpg";
          if (target && mode === "hold") {
            held = true;
            await gate;
          }
          const file = path.resolve(
            directory,
            target && mode === "substitute" ? "sources/frustum/touraeff-102.jpg" : relative,
          );
          if (!file.startsWith(`${directory}${path.sep}`)) {
            res.writeHead(404).end();
            return;
          }
          res.writeHead(200, {
            "Content-Type": mime[path.extname(file)] ?? "application/octet-stream",
            "Cache-Control": "no-store",
          });
          res.end(await readFile(file));
        } catch {
          res.writeHead(404).end();
        }
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const base = `http://127.0.0.1:${server.address().port}/seked/`;
      const context = await browser.newContext(),
        old = await context.newPage();
      try {
        await old.goto(`${base}?p=59&reading=working#reader`);
        await old.waitForFunction(
          () => document.querySelector("#offline").textContent === "Reading & source saved offline",
        );
        assert.equal(
          await old.getByRole("link", { name: "A pyramid without its point", exact: true }).count(),
          0,
        );
        directory = current;
        mode = scenario === "held-new-source" ? "hold" : "substitute";
        await old.evaluate(async () => {
          await (await navigator.serviceWorker.getRegistration()).update();
        });
        const room = await context.newPage();
        await room.goto(`${base}frustum.html#pieces`);
        await room.locator("#solid-drawing svg").waitFor();
        let pendingStatus;
        if (mode === "hold") {
          const started = Date.now();
          await room.waitForTimeout(8500);
          assert(held);
          pendingStatus = await room.locator("#offline").textContent();
          assert(!pendingStatus.includes("saved offline"));
          mode = "normal";
          release();
          report.cases.push({
            browser: name,
            scenario,
            heldMs: Date.now() - started,
            pendingStatus,
          });
        } else {
          await room.waitForFunction(() =>
            /unavailable|incomplete|different/.test(document.querySelector("#offline").textContent),
          );
          pendingStatus = await room.locator("#offline").textContent();
          assert(!pendingStatus.includes("saved offline"));
          const oldWorker = await old.evaluate(async () => {
            const channel = new MessageChannel();
            return new Promise((resolve) => {
              channel.port1.onmessage = (e) => {
                resolve(e.data);
                channel.port1.close();
              };
              navigator.serviceWorker.controller.postMessage({ type: "SEKED_INSPECT" }, [
                channel.port2,
              ]);
            });
          });
          assert.equal(oldWorker.edition, oldEdition);
          assert.equal(oldWorker.complete, true);
          mode = "normal";
          await room.evaluate(async () => {
            await (await navigator.serviceWorker.getRegistration()).update();
          });
          report.cases.push({
            browser: name,
            scenario,
            pendingStatus,
            previousCompleteEditionRetained: true,
          });
        }
        await room.waitForFunction(
          () => document.querySelector("#offline").textContent === "Reading & source saved offline",
        );
        await old.reload();
        await old.waitForFunction(
          () => document.querySelector("#offline").textContent === "Reading & source saved offline",
        );
        assert.equal(await old.locator('[data-problem="59"]').getAttribute("aria-pressed"), "true");
        await old.getByRole("link", { name: "A pyramid without its point", exact: true }).click();
        await old.locator("#solid-drawing svg").waitFor();
        const cacheNames = await old.evaluate(() => caches.keys());
        assert.deepEqual(
          cacheNames.filter((n) => n.startsWith("seked-")),
          [`seked-${newEdition}`],
        );
        await context.setOffline(true);
        await new Promise((resolve) => {
          server.closeAllConnections();
          server.close(resolve);
        });
        await old.locator('[data-page="100"]').click();
        await old.locator("#source-window img").waitFor();
        await old.reload();
        await old.locator("#source-window img").waitFor();
        assert.equal(await old.locator("[data-total]").getAttribute("data-total"), "56");
        report.cases.at(-1).newEditionComplete = true;
        report.cases.at(-1).onlyNewCacheRemains = true;
        report.cases.at(-1).newRoomAndSourceSurviveStoppedOrigin = true;
        console.log(
          `${name}: ${scenario}, existing tab recovered to the complete two-room edition.`,
        );
      } finally {
        release();
        await context.close();
        await new Promise((resolve) => {
          server.closeAllConnections();
          server.close(resolve);
        });
      }
    }
  } finally {
    await browser.close();
  }
}
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
