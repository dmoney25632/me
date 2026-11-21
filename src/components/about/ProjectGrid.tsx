"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, Gamepad2, Lock } from "lucide-react";
import { GitHubIcon } from "@/components/ui/brand-icons";
import { me, projects, type Project, type ProjectKind } from "@/content";
import { Reveal } from "@/components/ui/motion";
import { pill } from "@/components/ui/styles";

const KINDS = ["All", ...new Set(projects.map((p) => p.kind))] as const;

/** Cover art for projects without a screenshot. */
const COVER: Record<ProjectKind, string> = {
  AI: "from-[#4c2626] to-[#1e1914]",
  Game: "from-[#7a3b1d] to-[#1e1914]",
  Data: "from-[#1d3a4a] to-[#1e1914]",
  Web: "from-[#1d4a2b] to-[#1e1914]",
  Web3: "from-[#3b2d5c] to-[#1e1914]",
  SaaS: "from-[#16324f] to-[#1e1914]",
  Rust: "from-[#6b2f12] to-[#0e0c0a]",
};

function Cover({ p }: { p: Project }) {
  const href = p.links.play ?? p.links.live ?? p.links.code;
  const inner = p.logo ? (
    <div
      className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${COVER[p.kind]}`}
    >
      <div
        aria-hidden
        className="absolute -top-1/3 -right-1/4 size-[80%] rounded-full opacity-40 blur-3xl"
        style={{ background: p.color }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgb(255_255_255)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255)_1px,transparent_1px)] [background-size:28px_28px]"
      />
      <div className="relative flex h-full items-center justify-center">
        <Image
          src={p.logo}
          alt={`${p.name} logo`}
          width={128}
          height={128}
          className="size-20 rounded-[22%] shadow-[0_24px_50px_-14px_rgb(0_0_0/0.7)] transition-transform duration-700 group-hover:scale-105 sm:size-28"
        />
      </div>
    </div>
  ) : p.shot ? (
    <Image
      src={p.shot}
      alt={`${p.name} screenshot`}
      fill
      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
      sizes="(min-width: 768px) 560px, 100vw"
    />
  ) : (
    <div
      className={`absolute inset-0 grid place-items-center bg-gradient-to-br ${COVER[p.kind]} p-6`}
    >
      <span className="display text-center text-[clamp(2rem,4vw,2.8rem)] leading-none text-paper/90">
        {p.name}
      </span>
      <span className="absolute right-4 bottom-3 font-mono text-[11px] text-paper/40">
        {p.stack?.slice(0, 3).join(" · ")}
      </span>
    </div>
  );
  const cls =
    "group relative block aspect-[1440/760] overflow-hidden rounded-xl bg-paper-2 ring-1 ring-line";
  return href ? (
    <a
      href={href}
      {...newTab(href)}
      className={cls}
      aria-label={`Open ${p.name}`}
    >
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** External links open in a new tab; links within this site don't. */
const newTab = (href: string) => (href.startsWith("/") ? {} : { target: "_blank", rel: "noreferrer" });

function Links({ p }: { p: Project }) {
  return (
    <div className="flex flex-wrap gap-2">
      {p.links.play && (
        <a
          href={p.links.play}
          {...newTab(p.links.play)}
          className={`${pill} bg-glow text-ink-2`}
        >
          <Gamepad2 className="size-3.5" /> Play
        </a>
      )}
      {p.links.live && (
        <a
          href={p.links.live}
          target="_blank"
          rel="noreferrer"
          className={`${pill} bg-mint text-mint-ink`}
        >
          Live site <ArrowUpRight className="size-3.5" />
        </a>
      )}
      {p.links.code ? (
        <a
          href={p.links.code}
          target="_blank"
          rel="noreferrer"
          className={`${pill} bg-ink-2 text-paper`}
        >
          <GitHubIcon className="size-3.5" /> Code
        </a>
      ) : (
        <a
          href={me.links.github}
          target="_blank"
          rel="noreferrer"
          title="This repo is private. Here's my GitHub instead."
          className={`${pill} text-ink ring-1 ring-line hover:bg-paper-2`}
        >
          <Lock className="size-3.5" /> Private repo · GitHub
        </a>
      )}
    </div>
  );
}

function Card({ p }: { p: Project }) {
  return (
    <article className="flex h-full flex-col">
      <Cover p={p} />
      <p className="mt-5 font-mono text-[12px] text-ink/50">
        {p.kind} · {p.year}
        {p.featured && <span className="ml-2 text-brass">✦ favorite</span>}
      </p>
      <h3 className="display mt-1 text-[clamp(1.9rem,3vw,2.4rem)] text-ink">
        {p.name}
      </h3>
      <p className="mt-2 text-[16px] leading-relaxed text-ink/80">
        {p.oneLiner}
      </p>
      <div className="mt-5">
        <Links p={p} />
      </div>
      {p.howItWorks?.length ? (
        <details className="group/d mt-5 rounded-2xl bg-card ring-1 ring-line open:pb-5">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-[14px] font-medium text-ink [&::-webkit-details-marker]:hidden">
            How it&apos;s built
            <ChevronDown className="size-4 text-ink/50 transition-transform group-open/d:rotate-180" />
          </summary>
          <ul className="space-y-3 px-5">
            {p.howItWorks.map((b) => (
              <li
                key={b}
                className="flex gap-3 text-[14.5px] leading-relaxed text-ink/80"
              >
                <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-maroon/70" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-1.5 px-5">
            {p.stack?.map((t) => (
              <span
                key={t}
                className="rounded-full bg-paper-2 px-2.5 py-0.5 font-mono text-[11.5px] text-ink/70 ring-1 ring-line"
              >
                {t}
              </span>
            ))}
          </div>
        </details>
      ) : null}
    </article>
  );
}

/** Every project in src/content/projects.ts, filterable by kind. */
export function ProjectGrid() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");
  const shown =
    kind === "All" ? projects : projects.filter((p) => p.kind === kind);
  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter projects"
      >
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`${pill} h-8 px-3.5 ${kind === k ? "bg-ink-2 text-paper" : "text-ink/70 ring-1 ring-line hover:bg-paper-2"}`}
          >
            {k}
            <span className="font-mono text-[11px] opacity-60">
              {k === "All"
                ? projects.length
                : projects.filter((p) => p.kind === k).length}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-x-10 gap-y-16 md:grid-cols-2">
        {shown.map((p, i) => (
          <Reveal inView delay={(i % 2) * 0.08} key={p.id}>
            <Card p={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
