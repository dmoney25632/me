// Checks the compiled Rust module (public/wasm/kit.wasm) against Node's own
// crypto, and the terminal tools that use it. If the .wasm is stale or wrong,
// these fail.

import { createCipheriv, createHash, createHmac, pbkdf2Sync, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { neofetchCard, root } from "@/content/filesystem";
import { ITERATIONS, Kit, PW, fromBase64Url, toBase64Url, toHex, type KitExports } from "@/lib/kit";
import { redact, run, type Context } from "@/lib/terminal/commands";
import { HOME } from "@/lib/terminal/fs";
import { duration } from "@/lib/terminal/tools";
import type { Block, CommandResult } from "@/lib/terminal/types";

const mod = new WebAssembly.Module(readFileSync("public/wasm/kit.wasm"));
const kit = new Kit(new WebAssembly.Instance(mod, {}).exports as unknown as KitExports);

const ctx = (): Context => ({
  root,
  state: { cwd: [...HOME], history: [] },
  now: new Date(),
  card: neofetchCard,
  kit: async () => kit,
  random: (n) => new Uint8Array(randomBytes(n)),
});
const text = (blocks: Block[]) => blocks.map((b) => (b.kind === "line" ? b.spans.map((s) => s.text).join("") : b.kind)).join("\n");
const settle = async (r: CommandResult) => (r.async ? r.async(() => {}) : r.blocks);

/** The same scheme as rust/kit/src/cipher.rs, built from Node's OpenSSL. */
function nodeEncrypt(pass: string, msg: string, salt: Buffer, nonce: Buffer, iterations: number) {
  const master = pbkdf2Sync(pass, salt, iterations, 32, "sha256");
  const encKey = createHmac("sha256", master).update("kit/enc").digest();
  const macKey = createHmac("sha256", master).update("kit/mac").digest();
  const iv = Buffer.concat([Buffer.from([1, 0, 0, 0]), nonce]); // block counter 1, little-endian
  const c = createCipheriv("chacha20", encKey, iv);
  const iter = Buffer.alloc(4);
  iter.writeUInt32BE(iterations);
  const body = Buffer.concat([Buffer.from([1]), iter, salt, nonce, c.update(msg, "utf8"), c.final()]);
  return Buffer.concat([body, createHmac("sha256", macKey).update(body).digest()]);
}

describe("Rust crypto matches Node's", () => {
  it("SHA-256", () => {
    for (const input of ["", "abc", "héllo 🦀", "x".repeat(1000), randomBytes(4096).toString("latin1")])
      expect(toHex(kit.sha256(input))).toBe(createHash("sha256").update(input, "utf8").digest("hex"));
  });

  it("encrypt is byte-for-byte PBKDF2 + ChaCha20 + HMAC-SHA256", () => {
    const random = new Uint8Array(randomBytes(28));
    const salt = Buffer.from(random.subarray(0, 16));
    const nonce = Buffer.from(random.subarray(16));
    const ours = kit.encrypt("correct horse", "meet me at noon ☀️", random, 1000);
    expect(Buffer.from(ours).equals(nodeEncrypt("correct horse", "meet me at noon ☀️", salt, nonce, 1000))).toBe(true);
  });

  it("decrypts what Node encrypted, and refuses the wrong passphrase or a tampered blob", () => {
    const blob = new Uint8Array(nodeEncrypt("pw1234", "the eagle has landed", randomBytes(16), randomBytes(12), 500));
    expect(kit.decrypt("pw1234", blob)).toEqual({ ok: true, text: "the eagle has landed" });
    expect(kit.decrypt("pw1235", blob)).toEqual({ ok: false, reason: "rejected" });
    const bad = blob.slice();
    bad[40] ^= 1;
    expect(kit.decrypt("pw1234", bad)).toEqual({ ok: false, reason: "rejected" });
    expect(kit.decrypt("pw1234", new Uint8Array(10))).toEqual({ ok: false, reason: "malformed" });
  });

  it("uses a real work factor by default", { timeout: 30_000 }, () => {
    expect(ITERATIONS).toBeGreaterThanOrEqual(200_000);
    const blob = kit.encrypt("p", "m", new Uint8Array(28));
    expect(Buffer.from(blob.subarray(1, 5)).readUInt32BE()).toBe(ITERATIONS);
  });

  it("base64url round-trips", () => {
    const b = new Uint8Array(randomBytes(77));
    expect(fromBase64Url(toBase64Url(b))).toEqual(b);
    expect(fromBase64Url("not base64!")).toBeNull();
  });
});

describe("passwords", () => {
  it("flags leaked passwords and patterns", () => {
    expect(kit.password("P@ssw0rd").flags & PW.leaked).toBeTruthy();
    const r = kit.password("Summer2024!");
    expect(r.flags & PW.word && r.flags & PW.year).toBeTruthy();
    expect(r.bits).toBeLessThan(30);
    expect(kit.password("k9#Vq2!mZx7$Lp4w").bits).toBeGreaterThan(90);
  });

  it("generates from the right alphabet, with no repeats across calls", () => {
    const a = kit.pwgen(new Uint8Array(randomBytes(200)), 24, false);
    expect(a).toMatch(/^[A-Za-z0-9]{24}$/);
    expect(kit.pwgen(new Uint8Array(randomBytes(200)), 24, false)).not.toBe(a);
  });

  it("formats crack times for people", () => {
    expect(duration(0.2)).toBe("instantly");
    expect(duration(7200)).toBe("2 hours");
    expect(duration(3.2e9)).toBe("1 century");
    expect(duration(3.2e16)).toBe("1 billion years");
    expect(duration(1e30)).toMatch(/universe/);
  });
});

describe("terminal tools", () => {
  it("pwcheck asks without echo and never keeps the password", async () => {
    const r = run("pwcheck", ctx());
    expect(r.ask?.label).toBe("password:");
    const out = text(await settle(r.ask!.then("hunter2")));
    expect(out).toMatch(/very weak/);
    expect(out).toMatch(/most-leaked/);
    expect(out).not.toContain("hunter2");
    expect(redact("pwcheck hunter2")).toBe("pwcheck ••••••");
    expect(redact("password hunter2")).toBe("password ••••••");
    expect(redact("ls && pwcheck hunter2")).toBe("ls && pwcheck ••••••");
    expect(redact("pwcheck")).toBe("pwcheck");
    expect(redact("hash hello")).toBe("hash hello");
  });

  it("encrypt → decrypt works end to end through the prompts", { timeout: 60_000 }, async () => {
    const r = run('encrypt "meet me at noon"', ctx());
    const again = r.ask!.then("tangerine");
    const done = again.ask!.then("tangerine");
    const blocks = await settle(done);
    const blob = blocks[0].kind === "line" ? blocks[0].spans[0].text : "";
    expect(fromBase64Url(blob)?.length).toBeGreaterThan(60);

    const d = run(`decrypt ${blob}`, ctx());
    expect(text(await settle(d.ask!.then("tangerine")))).toContain("meet me at noon");
    expect(text(await settle(run(`decrypt ${blob}`, ctx()).ask!.then("orange")))).toMatch(/wrong passphrase/);
  });

  it("encrypt refuses mismatched or tiny passphrases", () => {
    const r = run("encrypt hi", ctx());
    expect(text(r.ask!.then("abc").blocks)).toMatch(/at least/);
    expect(text(r.ask!.then("abcdef").ask!.then("abcdeg").blocks)).toMatch(/didn't match/);
  });

  it("hash matches Node and shows the avalanche", async () => {
    const out = text(await settle(run("hash hello", ctx())));
    expect(out).toContain(createHash("sha256").update("hello").digest("hex"));
    expect(out).toContain(createHash("sha256").update("helln").digest("hex"));
  });

  it("pwgen makes four passwords of the asked length", async () => {
    const out = await settle(run("pwgen 16 -n", ctx()));
    const pws = out.slice(0, 4).map((b) => (b.kind === "line" ? b.spans[0].text : ""));
    for (const p of pws) expect(p).toMatch(/^[A-Za-z0-9]{16}$/);
    expect(text(run("pwgen 3", ctx()).blocks)).toMatch(/between 8 and 128/);
  });

  it("help lists the tools", () => {
    const out = text(run("help", ctx()).blocks);
    for (const c of ["pwcheck", "encrypt", "sysinfo", "fingerprint", "flock", "ip"]) expect(out).toContain(c);
    expect(out).not.toContain("lab");
  });
});

describe("chained commands", () => {
  it("runs every async command in a chain, in order", async () => {
    const out = text(await settle(run("hash a && echo mid && hash b", ctx())));
    const a = createHash("sha256").update("a").digest("hex");
    const b = createHash("sha256").update("b").digest("hex");
    expect(out.indexOf(a)).toBeGreaterThan(-1);
    expect(out.indexOf(a)).toBeLessThan(out.indexOf("mid"));
    expect(out.indexOf("mid")).toBeLessThan(out.indexOf(b));
  });
});
