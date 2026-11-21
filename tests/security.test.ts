// Guards for privacy and security. If one of these fails, don't ship.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import config from "../next.config";

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

describe("privacy", () => {
  it("no image in /public carries metadata (GPS, camera, etc.)", async () => {
    const images = walk("public").filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
    expect(images.length).toBeGreaterThan(0);
    for (const f of images) {
      const m = await sharp(f).metadata();
      expect({ file: f, exif: !!m.exif, xmp: !!m.xmp }).toEqual({ file: f, exif: false, xmp: false });
    }
  });

  it("never ships an email address or env file", () => {
    const files = [...walk("src"), ...walk("public")].filter((f) => /\.(tsx?|md|txt|json)$/.test(f));
    for (const f of files) expect(readFileSync(f, "utf8"), f).not.toMatch(/[\w.+-]+@(gmail|yahoo|outlook|icloud)\.com/i);
    expect(walk(".").some((f) => /(^|\/)\.env(\.|$)/.test(f) && !f.includes("node_modules"))).toBe(false);
  });
});

describe("security headers", () => {
  it("sends a strict CSP and anti-framing headers on every page", async () => {
    const rules = await config.headers!();
    const all = rules.find((r) => r.source === "/:path*")!;
    const h = Object.fromEntries(all.headers.map((x) => [x.key, x.value]));
    expect(h["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(h["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(h["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Strict-Transport-Security"]).toMatch(/max-age=\d{8}/);
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(config.poweredByHeader).toBe(false);
  });

  it("the Rust module imports nothing from the page", () => {
    const mod = new WebAssembly.Module(readFileSync("public/wasm/flock.wasm"));
    expect(WebAssembly.Module.imports(mod)).toEqual([]);
  });
});
