"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
}

export function Section({ id, index, title, children }: SectionProps) {
  return (
    <section id={id} className="py-14 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="container-narrow"
      >
        <div className="mb-10 flex items-center gap-4">
          <span className="font-mono text-xs text-accent">{index}</span>
          <h2 className="shrink-0 text-2xl font-semibold tracking-tight">{title}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        {children}
      </motion.div>
    </section>
  );
}
