// /lab: a Rust flocking simulation compiled to WebAssembly.
// The sim lives in rust/flock; rebuild it with `npm run wasm`.

import { statSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, SquareTerminal } from "lucide-react";
import { GitHubIcon } from "@/components/ui/brand-icons";
import { LabHero } from "@/components/lab/LabHero";
import { Reveal } from "@/components/ui/motion";
import { lab, me } from "@/content";

export const metadata: Metadata = {
  title: "Flock · Lab",
  description: lab.description,
};

// Read at build time, so the number on the page is always the real file size.
const wasmKb = (statSync(join(process.cwd(), "public/wasm/flock.wasm")).size / 1024).toFixed(0);

export default function LabPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-[#0e0c0a] text-white">
      <LabHero sourceUrl={lab.source} />

      <main id="how" className="scroll-mt-6 px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal inView>
            <p className="eyebrow text-[#f6dfa4]">How it works</p>
            <h2 className="display mt-3 max-w-3xl text-[clamp(2.4rem,6vw,4.2rem)]">
              Three rules, <span className="text-[#f6dfa4] italic">no leader.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/65">{lab.intro}</p>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3">
            {lab.rules.map((r, i) => (
              <Reveal inView delay={i * 0.08} key={r.title} className="bg-[#14110e] p-6 sm:p-8">
                <RuleDiagram kind={i} />
                <p className="mt-6 font-mono text-[12px] text-[#f6dfa4]">0{i + 1}</p>
                <p className="mt-1 text-[19px] font-medium">{r.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-white/60">{r.body}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-20 grid gap-10 md:mt-28 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
            <Reveal inView>
              <p className="eyebrow text-white/45">Under the hood</p>
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8">
                {[
                  { v: `${wasmKb} KB`, l: "of WebAssembly" },
                  { v: "0", l: "dependencies" },
                  { v: "O(n)", l: "neighbour search" },
                  { v: "60", l: "frames per second" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="display text-[clamp(2.4rem,5vw,3.4rem)] text-white">{s.v}</p>
                    <p className="mt-1 text-[13px] text-white/50">{s.l}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal inView delay={0.1}>
              <ul className="space-y-4">
                {lab.details.map((d) => (
                  <li key={d} className="flex gap-3 text-[15.5px] leading-relaxed text-white/75">
                    <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-[#f6dfa4]" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={lab.source}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-medium text-black transition-transform hover:scale-[1.04]"
                >
                  <GitHubIcon className="size-4" /> Read the Rust <ArrowUpRight className="size-4" />
                </a>
                <Link
                  href="/about#projects"
                  className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14px] text-white ring-1 ring-white/20 transition-colors hover:bg-white/10"
                >
                  More things I&apos;ve built
                </Link>
              </div>
            </Reveal>
          </div>

          <footer className="mt-24 flex flex-col gap-4 border-t border-white/10 pt-6 font-mono text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {me.name} · keys: <kbd className="text-white/70">space</kbd> pause, <kbd className="text-white/70">s</kbd>{" "}
              scatter, <kbd className="text-white/70">1</kbd>/<kbd className="text-white/70">2</kbd>/
              <kbd className="text-white/70">3</kbd> repel/attract/off
            </span>
            <span className="flex items-center gap-4">
              <Link href="/about" className="hover:text-white">
                About
              </Link>
              <Link href="/" className="flex items-center gap-1.5 hover:text-white">
                <SquareTerminal className="size-3.5" /> Terminal
              </Link>
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

/** Tiny diagrams for each rule: a bird (amber) and its neighbours. */
function RuleDiagram({ kind }: { kind: number }) {
  const bird = (x: number, y: number, a: number, fill: string) => (
    <path
      d="M7 0 L-4 -3.5 L-4 3.5 Z"
      transform={`translate(${x} ${y}) rotate(${a})`}
      fill={fill}
      key={`${x}-${y}`}
    />
  );
  const others = "rgb(255 255 255 / 0.45)";
  const me_ = "#f6dfa4";
  return (
    <svg viewBox="0 0 160 90" className="h-24 w-full" aria-hidden>
      <circle cx="80" cy="45" r="38" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeDasharray="3 4" />
      {kind === 0 && (
        <>
          {bird(62, 30, 200, others)}
          {bird(98, 34, -20, others)}
          {bird(70, 66, 140, others)}
          {bird(80, 45, 0, me_)}
          <path d="M80 45 L96 45" stroke={me_} strokeWidth="1.5" opacity="0.8" />
        </>
      )}
      {kind === 1 && (
        <>
          {bird(58, 30, -20, others)}
          {bird(100, 32, -25, others)}
          {bird(64, 62, -15, others)}
          {bird(98, 60, -22, others)}
          {bird(80, 45, 40, me_)}
          <path d="M80 45 Q92 44 100 38" stroke={me_} strokeWidth="1.5" fill="none" opacity="0.8" />
        </>
      )}
      {kind === 2 && (
        <>
          {bird(110, 26, 160, others)}
          {bird(118, 52, 190, others)}
          {bird(100, 68, 210, others)}
          {bird(54, 45, 0, me_)}
          <circle cx="109" cy="49" r="3" fill="none" stroke={others} />
          <path d="M60 45 L96 48" stroke={me_} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.8" />
        </>
      )}
    </svg>
  );
}
