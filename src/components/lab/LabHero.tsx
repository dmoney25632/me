"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { GitHubIcon } from "@/components/ui/brand-icons";
import { EASE_OUT } from "@/components/ui/motion";
import { FlockSim, type FlockStats } from "./FlockSim";

const fmt = new Intl.NumberFormat("en-US");

/** Full-screen sim with the title and live numbers floating over it. */
export function LabHero({ sourceUrl }: { sourceUrl: string }) {
  const [stats, setStats] = useState<FlockStats | null>(null);
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, ease: EASE_OUT, delay },
        };

  return (
    <section className="relative h-[82svh] min-h-[520px] overflow-hidden sm:h-[100svh]">
      <FlockSim onStats={setStats} />

      {/* soft shade so the title reads over the birds */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_12%_22%,rgb(14_12_10/0.85),transparent_70%)]"
      />

      {/* top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6">
        <Link
          href="/about"
          className="pointer-events-auto flex h-9 items-center gap-2 rounded-full bg-black/45 px-3.5 text-[13px] text-white/85 ring-1 ring-white/10 backdrop-blur-md hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Dayton Runyan
        </Link>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto flex h-9 items-center gap-2 rounded-full bg-white px-3.5 text-[13px] font-medium text-black hover:scale-[1.03]"
        >
          <GitHubIcon className="size-3.5" /> Rust source
        </a>
      </header>

      {/* title */}
      <div className="pointer-events-none absolute top-20 left-4 z-10 max-w-md sm:top-24 sm:left-10">
        <motion.p {...rise(0.1)} className="font-mono text-[11px] tracking-[0.14em] text-[#f6dfa4] uppercase">
          Lab · Rust → WebAssembly
        </motion.p>
        <motion.h1
          {...rise(0.2)}
          className="display mt-3 text-[clamp(4rem,12vw,8rem)] leading-[0.85] text-white [text-shadow:0_4px_40px_rgb(0_0_0/0.6)]"
        >
          Flock
        </motion.h1>
        <motion.p {...rise(0.35)} className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/75 sm:text-[16px]">
          {stats ? fmt.format(stats.birds) : "Thousands of"} birds. Three rules. No leader. Simulated in Rust, live in your
          browser. Move your cursor (or drag a finger) through them.
        </motion.p>
      </div>

      {/* live numbers */}
      <motion.dl
        {...rise(0.5)}
        className="absolute top-20 right-4 z-10 hidden w-48 space-y-2 rounded-2xl bg-black/45 p-4 font-mono text-[12px] text-white/60 ring-1 ring-white/10 backdrop-blur-md md:block"
        aria-live="off"
      >
        <Row label="birds" value={stats ? fmt.format(stats.birds) : "—"} />
        <Row label="fps" value={stats ? String(stats.fps) : "—"} />
        <Row label="rust step" value={stats ? `${stats.stepMs.toFixed(2)} ms` : "—"} />
        <div>
          <Row label="in sync" value={stats ? `${Math.round(stats.order * 100)}%` : "—"} />
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f6dfa4] to-[#7cb7ff] transition-[width] duration-500"
              style={{ width: `${Math.round((stats?.order ?? 0) * 100)}%` }}
            />
          </div>
        </div>
      </motion.dl>

      <a
        href="#how"
        className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-1.5 font-mono text-[11px] text-white/45 hover:text-white/80 sm:flex"
      >
        how it works <ArrowDown className="size-3" />
      </a>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="text-white tabular-nums">{value}</dd>
    </div>
  );
}
