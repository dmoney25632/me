// End-to-end smoke test: opens every page in headless Chrome at phone and
// desktop sizes and fails on console errors, CSP violations, sideways scroll,
// or a dead Rust flock in the terminal. Screenshots land in .smoke/.
//
//   npm run build && npm start      (in one terminal)
//   npm run smoke                   (in another; BASE=http://localhost:3000 by default)

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3000";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9400 + Math.floor(Math.random() * 400);
const ROUTES = ["/", "/about", "/?run=flock", "/net"];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, mobile: false, scale: 1 },
  { name: "phone", width: 390, height: 844, mobile: true, scale: 3 },
];

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}. Set CHROME=/path/to/chrome.`);
  process.exit(1);
}

const profile = mkdtempSync(join(tmpdir(), "smoke-"));
const chrome = spawn(
  CHROME,
  ["--headless=new", `--remote-debugging-port=${PORT}`, "--hide-scrollbars", "--mute-audio", `--user-data-dir=${profile}`, "about:blank"],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const page = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === "page");
      if (page) return new WebSocket(page.webSocketDebuggerUrl);
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome didn't start");
}

const ws = await connect();
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method) events.push(m);
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const evaluate = async (expression) =>
  (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

mkdirSync(".smoke", { recursive: true });
const failures = [];

for (const vp of VIEWPORTS) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.scale,
    mobile: vp.mobile,
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: vp.mobile });

  for (const route of ROUTES) {
    events.length = 0;
    await send("Page.navigate", { url: BASE + route });
    await sleep(3500);

    // Scroll through the page so scroll-triggered animations run.
    await evaluate(`(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.7) {
        scrollTo(0, y); await new Promise(r => setTimeout(r, 120));
      }
      scrollTo(0, 0); await new Promise(r => setTimeout(r, 600));
    })()`);

    const label = `${vp.name} ${route}`;
    const problems = [];
    for (const e of events) {
      const text =
        e.method === "Runtime.exceptionThrown"
          ? e.params.exceptionDetails.exception?.description ?? e.params.exceptionDetails.text
          : e.method === "Runtime.consoleAPICalled" && e.params.type === "error"
            ? e.params.args.map((a) => a.value ?? a.description).join(" ")
            : e.method === "Log.entryAdded" && e.params.entry.level === "error"
              ? e.params.entry.text
              : null;
      // Third-party IP lookups on /net can be blocked by networks or ad blockers; that's expected.
      if (text && !/ipwho\.is|ipapi\.co|ipify\.org/.test(text)) problems.push(text.split("\n")[0]);
    }
    const overflow = await evaluate("document.documentElement.scrollWidth - innerWidth");
    if (overflow > 0) problems.push(`page scrolls sideways by ${overflow}px`);

    if (route.includes("flock")) {
      const stats = await evaluate(`(async () => {
        await new Promise(r => setTimeout(r, 1500));
        const canvas = document.querySelector("canvas");
        if (!canvas) return { text: "no canvas", lit: 0 };
        const px = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
        let lit = 0; for (let i = 0; i < px.length; i += 4) if (px[i] + px[i+1] + px[i+2] > 120) lit++;
        return { text: canvas.parentElement.nextElementSibling?.innerText.replace(/\\n/g, " ") ?? "", lit };
      })()`);
      if (!stats || stats.lit < 20) problems.push(`sim isn't drawing birds (${stats?.lit ?? 0} lit pixels)`);
      console.log(`  ${label}: ${stats?.text || "(stats panel hidden on phones)"} · ${stats?.lit} lit pixels`);
    }

    const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
    writeFileSync(`.smoke/${vp.name}${route === "/" ? "-home" : route.replace(/[/?=]/g, "-")}.jpg`, Buffer.from(shot.result.data, "base64"));

    console.log(`${problems.length ? "✗" : "✓"} ${label}`);
    for (const p of problems) console.log(`    ${p}`);
    if (problems.length) failures.push(label);
  }
}

ws.close();
chrome.kill();
await sleep(300);
rmSync(profile, { recursive: true, force: true });

if (failures.length) {
  console.error(`\n${failures.length} page(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`\nAll ${ROUTES.length * VIEWPORTS.length} page loads passed. Screenshots in .smoke/`);
