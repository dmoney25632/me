// Typed wrapper around the Rust toolkit in rust/kit, compiled to
// public/wasm/kit.wasm (`npm run wasm`). The module has no imports: it can't
// reach the network or the page, only compute on the bytes we hand it.
//
// Pure: works in the browser (loadKit) and in Node tests (new Kit(exports)).

export interface KitExports {
  memory: WebAssembly.Memory;
  kit_alloc(len: number): number;
  kit_free(ptr: number, len: number): void;
  kit_out_ptr(): number;
  kit_out_len(): number;
  kit_out_clear(): void;
  kit_sha256(ptr: number, len: number): number;
  kit_encrypt(pp: number, pl: number, mp: number, ml: number, rp: number, rl: number, iterations: number): number;
  kit_decrypt(pp: number, pl: number, bp: number, bl: number): number;
  kit_password(ptr: number, len: number): number;
  kit_pwgen(rp: number, rl: number, len: number, symbols: number): number;
  // flock
  flock_new(n: number, w: number, h: number, seed: number): number;
  flock_free(world: number): void;
  flock_step(world: number, dt: number, px: number, py: number, pointer: number): void;
  flock_resize(world: number, w: number, h: number): void;
  flock_set_count(world: number, n: number): void;
  flock_set_params(world: number, sep: number, ali: number, coh: number, speed: number): void;
  flock_scatter(world: number): void;
  flock_data(world: number): number;
  flock_count(world: number): number;
  flock_order(world: number): number;
}

/** Must match rust/kit/src/cipher.rs. */
export const ITERATIONS = 210_000;
export const RANDOM_BYTES = 28;

/** Must match the flag bits in rust/kit/src/password.rs. */
export const PW = {
  lower: 1,
  upper: 2,
  digit: 4,
  symbol: 8,
  other: 16,
  leaked: 32,
  word: 64,
  sequence: 128,
  repeat: 256,
  year: 512,
  short: 1024,
} as const;

export interface PasswordReport {
  bits: number;
  flags: number;
  length: number;
  pool: number;
}

export type Decrypted = { ok: true; text: string } | { ok: false; reason: "malformed" | "rejected" };

const enc = new TextEncoder();
const dec = new TextDecoder("utf-8", { fatal: false });

export class Kit {
  constructor(readonly x: KitExports) {}

  /** Copy bytes into wasm memory for the length of `fn`, then wipe and free them. */
  private with<T>(inputs: Uint8Array[], fn: (args: number[]) => T): T {
    const ptrs = inputs.map((b) => {
      const p = this.x.kit_alloc(b.length);
      if (!p && b.length) throw new Error("input too large");
      new Uint8Array(this.x.memory.buffer, p, b.length).set(b);
      return p;
    });
    try {
      return fn(ptrs.flatMap((p, i) => [p, inputs[i].length]));
    } finally {
      ptrs.forEach((p, i) => this.x.kit_free(p, inputs[i].length));
    }
  }

  /** Copy the output buffer out of wasm memory, then wipe it there. */
  private out(): Uint8Array {
    const copy = new Uint8Array(this.x.memory.buffer, this.x.kit_out_ptr(), this.x.kit_out_len()).slice();
    this.x.kit_out_clear();
    return copy;
  }

  sha256(data: Uint8Array | string): Uint8Array {
    const bytes = typeof data === "string" ? enc.encode(data) : data;
    this.with([bytes], ([p, l]) => this.x.kit_sha256(p, l));
    return this.out();
  }

  encrypt(pass: string, message: string, random: Uint8Array, iterations = ITERATIONS): Uint8Array {
    const code = this.with([enc.encode(pass), enc.encode(message), random], (a) =>
      this.x.kit_encrypt(a[0], a[1], a[2], a[3], a[4], a[5], iterations),
    );
    if (code !== 0) throw new Error("encrypt needs 28 random bytes");
    return this.out();
  }

  decrypt(pass: string, blob: Uint8Array): Decrypted {
    const code = this.with([enc.encode(pass), blob], (a) => this.x.kit_decrypt(a[0], a[1], a[2], a[3]));
    if (code === 1) return { ok: false, reason: "malformed" };
    if (code === 2) return { ok: false, reason: "rejected" };
    return { ok: true, text: dec.decode(this.out()) };
  }

  password(pw: string): PasswordReport {
    this.with([enc.encode(pw)], ([p, l]) => this.x.kit_password(p, l));
    const v = new Float64Array(this.out().buffer);
    return { bits: v[0], flags: v[1], length: v[2], pool: v[3] };
  }

  pwgen(random: Uint8Array, length: number, symbols: boolean): string {
    this.with([random], ([p, l]) => this.x.kit_pwgen(p, l, length, symbols ? 1 : 0));
    return dec.decode(this.out());
  }
}

// ------------------------------------------------------------------ encoding

export function toHex(b: Uint8Array) {
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

/** URL-safe base64 without padding, so a blob is one clean word in the terminal. */
export function toBase64Url(b: Uint8Array) {
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(s: string): Uint8Array | null {
  const clean = s.replace(/\s+/g, "");
  if (!/^[A-Za-z0-9_-]+$/.test(clean)) return null;
  try {
    const bin = atob(clean.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (clean.length % 4)) % 4));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ loading

const WASM_URL = "/wasm/kit.wasm";
let cached: Promise<Kit> | null = null;

/** Fetches and compiles the module once per page load. */
export function loadKit(): Promise<Kit> {
  cached ??= (async () => {
    const res = await fetch(WASM_URL);
    if (!res.ok) throw new Error(`couldn't load the Rust module (${res.status})`);
    const { instance } = await WebAssembly.instantiate(await res.arrayBuffer(), {});
    return new Kit(instance.exports as unknown as KitExports);
  })();
  cached.catch(() => (cached = null));
  return cached;
}
