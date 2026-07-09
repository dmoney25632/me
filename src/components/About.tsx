"use client";

import { motion } from "framer-motion";
import { about, experience } from "@/data/site";
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
                className="group rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-300 hover:border-accent/25 hover:bg-white/[0.05]"
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

        <div className="mt-20 md:mt-28">
          <motion.h3
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="mb-10 text-xl font-semibold tracking-tight text-white sm:text-2xl"
          >
            Experience
          </motion.h3>

          <div className="relative space-y-0">
            <div className="absolute bottom-0 left-[7px] top-2 w-px bg-gradient-to-b from-accent/40 via-white/10 to-transparent md:left-[11px]" />

            {experience.map((job, i) => (
              <motion.article
                key={`${job.company}-${job.role}`}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: i * 0.04,
                }}
                className="relative grid gap-2 border-b border-white/[0.06] py-8 pl-8 last:border-0 md:grid-cols-[220px_1fr] md:gap-10 md:pl-12"
              >
                <div className="absolute left-0 top-10 h-3.5 w-3.5 rounded-full border-2 border-accent/50 bg-[#050505] md:top-11 md:h-4 md:w-4" />
                <div>
                  <p className="text-sm font-medium text-white">{job.role}</p>
                  <p className="mt-1 text-sm text-accent/90">{job.company}</p>
                  <p className="mt-2 text-xs text-zinc-500">{job.period}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">{job.location}</p>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400 md:pt-0.5">
                  {job.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
