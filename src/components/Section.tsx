"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="container-narrow"
      >
        <div className="mb-8 flex items-center gap-4">
          <h2 className="shrink-0 text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        {children}
      </motion.div>
    </section>
  );
}

interface TimelineRowProps {
  period: string;
  children: ReactNode;
}

/** Date on the left, content on the right (stacks on phones). */
export function TimelineRow({ period, children }: TimelineRowProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-6">
      <p className="pt-0.5 font-mono text-xs text-subtle">{period}</p>
      <div>{children}</div>
    </div>
  );
}
