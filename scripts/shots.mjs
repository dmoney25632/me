// Take a website screenshot for a project or company card.
//
//   npm run shots -- <id> <url>
//   npm run shots -- corva https://corva-insurance.vercel.app
//   npm run shots -- kit "http://localhost:3000/?run=flock"   (while `npm run dev` runs)
//
// Saves public/shots/<id>.jpg (1440×760). Then set `shot: "/shots/<id>.jpg"`
// in src/content/projects.ts or companies.ts. Needs Google Chrome (macOS);
// set CHROME=/path/to/chrome to use a different browser binary.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [id, url] = process.argv.slice(2);
if (!id || !/^(https:\/\/|http:\/\/localhost[:/])/.test(url ?? "")) {
  console.error("usage: npm run shots -- <id> <https://url>");
  process.exit(1);
}

const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(chrome)) {
  console.error(`Chrome not found at ${chrome}. Set CHROME=/path/to/chrome.`);
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "shots-"));
const png = join(dir, "shot.png");
const out = join("public", "shots", `${id}.jpg`);

execFileSync(chrome, [
  "--headless=new",
  "--hide-scrollbars",
  "--window-size=1440,760",
  "--virtual-time-budget=8000",
  `--user-data-dir=${join(dir, "profile")}`,
  `--screenshot=${png}`,
  url,
], { stdio: "ignore" });

// Re-encode with sharp (ships with Next) so the file carries no metadata.
const { default: sharp } = await import("sharp");
await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
rmSync(dir, { recursive: true, force: true });
console.log(`saved ${out}  →  shot: "/shots/${id}.jpg"`);
