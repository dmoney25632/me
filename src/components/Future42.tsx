"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { future42 } from "@/data/site";
import { Section } from "./Section";

const { product } = future42;

/** Example messages from VAL, styled like phone notifications. */
const examples = [
  {
    time: "9:12 PM",
    label: "Nightly push",
    text: "Alignment attach slipped to 18% yesterday. Have every writer pitch it at the morning huddle.",
  },
  {
    time: "7:00 AM",
    label: "Ask VAL",
    q: "Who sold the most tires yesterday?",
    text: "Marco sold 24 tires, 6 more than anyone else. Want me to send him a shout-out?",
  },
];

function Notification({ item, i }: { item: (typeof examples)[number]; i: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.25 + i * 0.35 }}
      className="rounded-2xl border border-border bg-background/80 p-3.5 shadow-lg shadow-black/5 backdrop-blur dark:shadow-black/30"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent font-mono text-[10px] font-bold text-background">
          V
        </span>
        <span className="text-xs font-semibold">VAL</span>
        <span className="font-mono text-[10px] text-subtle">· {item.label}</span>
        <span className="ml-auto font-mono text-[10px] text-subtle">{item.time}</span>
      </div>
      {"q" in item && item.q && (
        <p className="mt-2 text-[13px] italic text-muted">&ldquo;{item.q}&rdquo;</p>
      )}
      <p className="mt-1.5 text-[13px] leading-snug">{item.text}</p>
    </motion.div>
  );
}

export function Future42() {
  return (
    <Section id="future42" index="01" title="Now: Future 42">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/40">
        <div aria-hidden className="hero-glow pointer-events-none absolute inset-0" />
        <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 opacity-60" />

        <div className="relative grid gap-8 p-6 sm:grid-cols-[1.15fr_1fr] sm:p-8">
          <div>
            <a
              href={future42.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-accent hover:underline"
            >
              {future42.name}
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.name}
              <span className="text-accent">.</span>
            </h3>
            <p className="mt-1 font-display text-xl italic text-muted">{product.tagline}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{product.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
              >
                See VAL
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href={future42.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                ftr42.com
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3" aria-label="Example messages from VAL">
            {examples.map((item, i) => (
              <Notification key={item.label} item={item} i={i} />
            ))}
            <p className="text-center font-mono text-[10px] text-subtle">examples</p>
          </div>
        </div>

        <div className="relative grid border-t border-border sm:grid-cols-3">
          {product.pillars.map((p, i) => (
            <div
              key={p.title}
              className={`p-6 ${i > 0 ? "border-t border-border sm:border-l sm:border-t-0" : ""}`}
            >
              <p className="font-mono text-[11px] text-accent">0{i + 1}</p>
              <h4 className="mt-2 font-semibold tracking-tight">{p.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="relative flex flex-wrap items-center gap-1.5 border-t border-border px-6 py-4">
          <span className="mr-1 font-mono text-[11px] text-subtle">ships with</span>
          {product.surfaces.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted">{future42.blurb}</p>
    </Section>
  );
}
