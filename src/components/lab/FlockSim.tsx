"use client";

import { useEffect, useRef, useState } from "react";
import { Hand, Magnet, Pause, Play, Shuffle, SlidersHorizontal, X } from "lucide-react";
import { POINTER, loadFlock, readBirds, type FlockExports, type PointerMode } from "./wasm";

interface Params {
  separation: number;
  alignment: number;
  cohesion: number;
  speed: number;
  birds: number;
}

const DESKTOP: Params = { separation: 1.6, alignment: 1.0, cohesion: 0.9, speed: 170, birds: 2400 };
const PHONE: Params = { ...DESKTOP, speed: 130, birds: 800 };

const SLIDERS: { key: keyof Params; label: string; min: number; max: number; step: number; hint: string }[] = [
  { key: "separation", label: "Separation", min: 0, max: 4, step: 0.1, hint: "don't crowd" },
  { key: "alignment", label: "Alignment", min: 0, max: 3, step: 0.1, hint: "fly together" },
  { key: "cohesion", label: "Cohesion", min: 0, max: 3, step: 0.1, hint: "stay close" },
  { key: "speed", label: "Speed", min: 40, max: 400, step: 5, hint: "px / second" },
  { key: "birds", label: "Birds", min: 100, max: 6000, step: 100, hint: "how many" },
];

/** Heading → colour: 32 steps around a warm-to-cool loop, so birds flying the same way share a colour. */
const STOPS = [
  [255, 214, 140], // amber
  [255, 128, 92], // coral
  [230, 90, 130], // rose
  [146, 124, 255], // violet
  [110, 180, 255], // sky
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

export interface FlockStats {
  fps: number;
  stepMs: number;
  birds: number;
  order: number;
}

export function FlockSim({ onStats }: { onStats?: (s: FlockStats) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mode, setMode] = useState<PointerMode>("repel");
  const [paused, setPaused] = useState(false);
  const [params, setParams] = useState<Params>(DESKTOP);
  const [tuning, setTuning] = useState(false);

  // Everything the animation loop reads, kept off React's render path.
  const live = useRef({ mode, paused, params, px: 0, py: 0, pointerOn: false, scatter: false });
  const onStatsRef = useRef(onStats);
  useEffect(() => {
    live.current.mode = mode;
    live.current.paused = paused;
    live.current.params = params;
    onStatsRef.current = onStats;
  }, [mode, paused, params, onStats]);

  // Phones get fewer birds; reduced-motion visitors start paused.
  useEffect(() => {
    const small = window.matchMedia("(max-width: 700px)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (small) setParams(PHONE); // eslint-disable-line react-hooks/set-state-in-effect -- one-time device check
    if (still) setPaused(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let wasm: FlockExports | null = null;
    let world = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let frames = 0;
    let stepTotal = 0;
    let statsAt = last;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let appliedCount = 0;
    let buckets = new Uint8Array(0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0e0c0a";
      ctx.fillRect(0, 0, w, h);
      if (wasm && world) wasm.flock_resize(world, w, h);
    };

    const draw = (birds: Float32Array, n: number) => {
      // Fading trails: paint a translucent veil instead of clearing.
      ctx.fillStyle = "rgba(14, 12, 10, 0.3)";
      ctx.fillRect(0, 0, w, h);
      if (buckets.length < n) buckets = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const a = birds[i * 4 + 2];
        buckets[i] = Math.floor((((a % TAU) + TAU) % TAU) / TAU * PALETTE.length) % PALETTE.length;
      }
      const len = n > 3000 ? 5 : 7;
      for (let b = 0; b < PALETTE.length; b++) {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          if (buckets[i] !== b) continue;
          const x = birds[i * 4];
          const y = birds[i * 4 + 1];
          const a = birds[i * 4 + 2];
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

      const p = L.params;
      if (p.birds !== appliedCount) {
        wasm.flock_set_count(world, p.birds);
        appliedCount = p.birds;
      }
      wasm.flock_set_params(world, p.separation, p.alignment, p.cohesion, p.speed);
      if (L.scatter) {
        wasm.flock_scatter(world);
        L.scatter = false;
      }

      let stepMs = 0;
      if (!L.paused) {
        const t0 = performance.now();
        wasm.flock_step(world, dt, L.px, L.py, L.pointerOn ? POINTER[L.mode] : POINTER.none);
        stepMs = performance.now() - t0;
      }
      const n = wasm.flock_count(world);
      draw(readBirds(wasm, world), n);

      frames++;
      stepTotal += stepMs;
      if (now - statsAt > 500) {
        onStatsRef.current?.({
          fps: Math.round((frames * 1000) / (now - statsAt)),
          stepMs: stepTotal / frames,
          birds: n,
          order: wasm.flock_order(world),
        });
        frames = 0;
        stepTotal = 0;
        statsAt = now;
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Stop work when the canvas is off screen or the tab is hidden.
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting && !document.hidden));
    io.observe(canvas);
    const onVis = () => (visible = !document.hidden);
    document.addEventListener("visibilitychange", onVis);

    let cancelled = false;
    loadFlock()
      .then((mod) => {
        if (cancelled) return;
        wasm = mod;
        appliedCount = live.current.params.birds;
        world = mod.flock_new(appliedCount, w, h, (Math.random() * 2 ** 31) | 1);
        setStatus("ready");
        raf = requestAnimationFrame(frame);
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      if (wasm && world) wasm.flock_free(world);
    };
  }, []);

  // Space = pause, S = scatter, 1/2/3 = pointer mode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key.toLowerCase() === "s") live.current.scatter = true;
      else if (e.key === "1") setMode("repel");
      else if (e.key === "2") setMode("attract");
      else if (e.key === "3") setMode("none");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>, on: boolean) => {
    const r = e.currentTarget.getBoundingClientRect();
    live.current.px = e.clientX - r.left;
    live.current.py = e.clientY - r.top;
    live.current.pointerOn = on;
  };

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-crosshair touch-none"
        aria-label="Flocking simulation. Move your pointer over it to push the birds around."
        role="img"
        onPointerMove={(e) => point(e, e.pointerType === "mouse" || e.buttons > 0)}
        onPointerDown={(e) => point(e, true)}
        onPointerUp={(e) => point(e, e.pointerType === "mouse")}
        onPointerLeave={(e) => point(e, false)}
        onPointerCancel={(e) => point(e, false)}
      />

      {status !== "ready" && (
        <div className="absolute inset-0 grid place-items-center font-mono text-[13px] text-white/60">
          {status === "loading" ? (
            <span className="animate-pulse">compiling Rust → WebAssembly…</span>
          ) : (
            <span>Couldn&apos;t start the sim in this browser.</span>
          )}
        </div>
      )}

      {/* control dock */}
      <div className="absolute inset-x-3 bottom-3 z-10 flex justify-center sm:inset-x-6 sm:bottom-6">
        <div className="w-full max-w-3xl rounded-2xl bg-black/55 p-2 text-white shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/10 backdrop-blur-xl">
          {tuning && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 border-b border-white/10 px-3 pt-2 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              {SLIDERS.map((s) => (
                <label key={s.key} className="block">
                  <span className="flex items-baseline justify-between font-mono text-[11px] text-white/55">
                    <span className="text-white/85">{s.label}</span>
                    <span>
                      {params[s.key]} <span className="text-white/35">· {s.hint}</span>
                    </span>
                  </span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={params[s.key]}
                    onChange={(e) => setParams((p) => ({ ...p, [s.key]: Number(e.target.value) }))}
                    className="lab-range mt-1.5 w-full"
                  />
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <div className="flex rounded-xl bg-white/5 p-0.5" role="radiogroup" aria-label="What your pointer does">
              {(
                [
                  ["repel", "Repel", Hand],
                  ["attract", "Attract", Magnet],
                ] as const
              ).map(([m, label, Icon]) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(mode === m ? "none" : m)}
                  className={`flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] transition-colors ${
                    mode === m ? "bg-white text-black" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden min-[380px]:inline">{label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play" : "Pause"}
              className="grid size-9 place-items-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => (live.current.scatter = true)}
              aria-label="Scatter the flock"
              className="grid size-9 place-items-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Shuffle className="size-4" />
            </button>

            <div className="flex-1" />

            <button
              type="button"
              onClick={() => setTuning((t) => !t)}
              aria-expanded={tuning}
              className={`flex h-9 items-center gap-2 rounded-xl px-3 text-[13px] transition-colors ${
                tuning ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tuning ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
              Tune
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
