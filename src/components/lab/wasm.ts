"use client";

// Loads the Rust/WebAssembly flocking sim (rust/flock, compiled to
// public/wasm/flock.wasm) and wraps its C-style exports in a small typed API.

export interface FlockExports {
  memory: WebAssembly.Memory;
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

export const POINTER = { none: 0, attract: 1, repel: 2 } as const;
export type PointerMode = keyof typeof POINTER;

const WASM_URL = "/wasm/flock.wasm";

let cached: Promise<FlockExports> | null = null;

/** Fetches and compiles the module once per page load. */
export function loadFlock(): Promise<FlockExports> {
  cached ??= (async () => {
    const res = await fetch(WASM_URL);
    if (!res.ok) throw new Error(`couldn't load ${WASM_URL} (${res.status})`);
    const bytes = await res.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(bytes, {});
    return instance.exports as unknown as FlockExports;
  })();
  cached.catch(() => (cached = null));
  return cached;
}

/** A live view over one bird's packed data: x, y, heading (rad), speed (0..1). */
export function readBirds(wasm: FlockExports, world: number): Float32Array {
  const n = wasm.flock_count(world);
  // Re-created every frame: if Rust grows its memory, old views go stale.
  return new Float32Array(wasm.memory.buffer, wasm.flock_data(world), n * 4);
}
