"use client";

// The `flock` command: a boids sim from rust/kit/src/flock.rs, drawn inline
// in the terminal. Rust moves the birds; JS reads their positions straight
// out of WebAssembly memory each frame and paints them.

import { useEffect, useRef, useState } from "react";
import { loadKit, type KitExports } from "@/lib/kit";

const POINTER = { none: 0, attract: 1, repel: 2 } as const;
type Mode = "repel" | "attract";

/** Heading → colour, so birds flying the same way share one. */
const STOPS = [
  [255, 214, 140],
  [255, 128, 92],
  [230, 90, 130],
  [146, 124, 255],
  [110, 180, 255],
];
const PALETTE = Array.from({ length: 32 }, (_, i) => {
  const t = (i / 32) * STOPS.length;
  const a = STOPS[Math.floor(t) % STOPS.length];
  const b = STOPS[(Math.floor(t) + 1) % STOPS.length];
  const f = t - Math.floor(t);
  const mix = (k: number) => Math.round(a[k] + (b[k] - a[k]) * f);
  return `rgb(${mix(0)} ${mix(1)} ${mix(2)})`;
});
const TAU = Math.PI * 2;
const BG = "#0b0b0d";

interface Stats {
  fps: number;
  stepMs: number;
  order: number;
}

export function FlockView({ birds }: { birds: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mode, setMode] = useState<Mode>("repel");
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const live = useRef({ mode, paused, px: 0, py: 0, held: false, inside: false, scatter: false, birds });

  useEffect(() => {
    live.current.mode = mode;
    live.current.paused = paused;
  }, [mode, paused]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true); // eslint-disable-line react-hooks/set-state-in-effect -- one-time preference check
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    let wasm: KitExports | null = null;
    let world = 0;
    let raf = 0;
    let visible = true;
    let w = 1;
    let h = 1;
    let last = performance.now();
    let frames = 0;
    let stepTotal = 0;
    let statsAt = last;
    let buckets = new Uint8Array(0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      if (wasm && world) wasm.flock_resize(world, w, h);
    };

    const draw = (data: Float32Array, n: number) => {
      ctx.fillStyle = "rgba(11, 11, 13, 0.32)"; // fading trails
      ctx.fillRect(0, 0, w, h);
      if (buckets.length < n) buckets = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const a = data[i * 4 + 2];
        buckets[i] = Math.floor(((((a % TAU) + TAU) % TAU) / TAU) * PALETTE.length) % PALETTE.length;
      }
      const len = n > 3000 ? 4.5 : 6;
      for (let b = 0; b < PALETTE.length; b++) {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          if (buckets[i] !== b) continue;
          const x = data[i * 4];
          const y = data[i * 4 + 1];
          const a = data[i * 4 + 2];
          const c = Math.cos(a);
          const s = Math.sin(a);
          ctx.moveTo(x + c * len, y + s * len);
          ctx.lineTo(x - c * len * 0.6 - s * len * 0.42, y - s * len * 0.6 + c * len * 0.42);
          ctx.lineTo(x - c * len * 0.6 + s * len * 0.42, y - s * len * 0.6 - c * len * 0.42);
          ctx.closePath();
        }
        ctx.fillStyle = PALETTE[b];
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!wasm || !world || !visible) {
        last = now;
        return;
      }
      const L = live.current;
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (L.scatter) {
        wasm.flock_scatter(world);
        L.scatter = false;
      }
      let stepMs = 0;
      if (!L.paused) {
        // Hovering pushes; holding the button (or a finger) pulls.
        const pointer = !L.inside ? POINTER.none : L.held ? POINTER[L.mode === "repel" ? "attract" : "repel"] : POINTER[L.mode];
        const t0 = performance.now();
        wasm.flock_step(world, dt, L.px, L.py, pointer);
        stepMs = performance.now() - t0;
      }
      const n = wasm.flock_count(world);
      // Re-made every frame: if Rust grows its memory, old views go stale.
      draw(new Float32Array(wasm.memory.buffer, wasm.flock_data(world), n * 4), n);

      frames++;
      stepTotal += stepMs;
      if (now - statsAt > 600) {
        setStats({ fps: Math.round((frames * 1000) / (now - statsAt)), stepMs: stepTotal / frames, order: wasm.flock_order(world) });
        frames = 0;
        stepTotal = 0;
        statsAt = now;
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    // No work while scrolled out of view or in a background tab.
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting && !document.hidden));
    io.observe(canvas);

    let cancelled = false;
    loadKit()
      .then((kit) => {
        if (cancelled) return;
        wasm = kit.x;
        const small = window.matchMedia("(max-width: 700px)").matches;
        const n = small ? Math.min(live.current.birds, 900) : live.current.birds;
        world = wasm.flock_new(n, w, h, crypto.getRandomValues(new Uint32Array(1))[0] | 1);
        setStatus("ready");
        raf = requestAnimationFrame(frame);
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (wasm && world) wasm.flock_free(world);
    };
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>, patch: Partial<typeof live.current>) => {
    const r = e.currentTarget.getBoundingClientRect();
    Object.assign(live.current, { px: e.clientX - r.left, py: e.clientY - r.top, ...patch });
  };

  const btn = "rounded px-1.5 transition-colors hover:bg-white/10";

  return (
    <div className="my-2 max-w-[820px]" onClick={(e) => e.stopPropagation()}>
      <div className="relative overflow-hidden rounded-md border border-white/10">
        <canvas
          ref={canvasRef}
          className="block h-[260px] w-full cursor-crosshair touch-none sm:h-[320px]"
          role="img"
          aria-label="A flock of birds simulated in Rust. Move your pointer over it to push them around."
          onPointerMove={(e) => point(e, { inside: true })}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            point(e, { inside: true, held: true });
          }}
          onPointerUp={(e) => point(e, { held: false, inside: e.pointerType === "mouse" })}
          onPointerLeave={(e) => point(e, { inside: false, held: false })}
          onPointerCancel={(e) => point(e, { inside: false, held: false })}
        />
        {status === "error" && (
          <div className="absolute inset-0 grid place-items-center text-t-red">couldn&apos;t start the sim in this browser</div>
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[12px] text-t-muted">
        <span>
          cursor:{" "}
          {(["repel", "attract"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`${btn} ${mode === m ? "text-t-green" : ""}`} aria-pressed={mode === m}>
              {m}
            </button>
          ))}
        </span>
        <button type="button" onClick={() => setPaused((p) => !p)} className={`${btn} text-t-cyan`}>
          {paused ? "play" : "pause"}
        </button>
        <button type="button" onClick={() => (live.current.scatter = true)} className={`${btn} text-t-cyan`}>
          scatter
        </button>
        <span className="ml-auto tabular-nums">
          {stats ? (
            `${stats.fps} fps · Rust step ${stats.stepMs.toFixed(2)} ms · ${Math.round(stats.order * 100)}% aligned`
          ) : status === "loading" ? (
            <span className="animate-pulse">loading Rust → WebAssembly…</span>
          ) : null}
        </span>
      </div>
    </div>
  );
}
