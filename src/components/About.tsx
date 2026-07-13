"use client";

import { motion } from "framer-motion";
import { about } from "@/data/site";
import { SectionHeading } from "./SectionHeading";

export function About() {
  return (
    <section id="about" className="section-pad relative">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="About"
          title="Builder. Operator. Founder."
          description="Where systems, service, and ambition meet."
        />

        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div className="space-y-6">
            {about.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: i * 0.06,
                }}
                className="text-base leading-[1.8] text-zinc-400 sm:text-lg"
              >
                {p}
              </motion.p>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            className="grid grid-cols-2 gap-3 self-start"
          >
            {about.highlights.map((h) => (
              <div
                key={h.label}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {h.label}
                </p>
                <p className="mt-2 text-sm font-medium tracking-tight text-white sm:text-base">
                  {h.value}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
