"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { HeroBackground } from "./HeroBackground";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 18,
      delay: 0.1 + i * 0.08,
    },
  }),
};

export function Hero() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-20"
    >
      <HeroBackground />

      <div className="container-narrow relative z-10 grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-24">
        <div>
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-accent"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {siteConfig.title} · {siteConfig.location}
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-5xl font-semibold tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-[5.25rem] lg:leading-[0.95]"
          >
            {siteConfig.name.split(" ")[0]}
            <br />
            <span className="text-zinc-500">{siteConfig.name.split(" ")[1]}</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-xl font-medium tracking-tight text-zinc-200 sm:text-2xl"
          >
            {siteConfig.tagline}
          </motion.p>

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 max-w-lg text-base leading-relaxed text-muted sm:text-[1.05rem]"
          >
            {siteConfig.supporting}
          </motion.p>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={() => scrollTo("#projects")}
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-[#050505] transition-all duration-300 hover:glow-accent hover:brightness-110"
            >
              View Projects
              <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo("#connect")}
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-zinc-200 backdrop-blur-xl transition-all duration-300 hover:border-accent/40 hover:text-white"
            >
              Get in touch
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.25 }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-accent/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-2 shadow-[0_0_60px_rgba(0,245,255,0.12)] backdrop-blur-xl">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] ring-1 ring-accent/20">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                alt={`${siteConfig.name} — profile photo`}
                fill
                priority
                sizes="(max-width: 768px) 80vw, 400px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs uppercase tracking-[0.2em] text-accent/80">
                  Currently building
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  Evrcad · SaaS for Medicare agencies
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
