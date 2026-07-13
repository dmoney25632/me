"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { siteConfig } from "@/data/site";
import { HeroBackground } from "./HeroBackground";
import { GithubIcon, LinkedinIcon, XIcon } from "./icons";

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

const heroSocials = [
  { name: "X / Twitter", href: siteConfig.socials.twitter, icon: XIcon },
  { name: "LinkedIn", href: siteConfig.socials.linkedin, icon: LinkedinIcon },
  { name: "GitHub", href: siteConfig.socials.github, icon: GithubIcon },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <HeroBackground />

      <div className="container-narrow relative z-10 grid items-center gap-14 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:py-28">
        <div>
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-6 text-sm tracking-wide text-zinc-500"
          >
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
            className="mt-6 max-w-xl text-xl font-medium tracking-tight text-zinc-300 sm:text-2xl"
          >
            {siteConfig.tagline}
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <a
              href={`mailto:${siteConfig.email}`}
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-[#050505] transition-all duration-300 hover:glow-accent hover:brightness-110"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{siteConfig.email}</span>
            </a>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex items-center gap-2"
          >
            {heroSocials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition-colors duration-300 hover:text-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          <div className="absolute -inset-6 rounded-[2rem] bg-accent/8 blur-3xl" />
          <div className="relative overflow-hidden rounded-[1.5rem]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <Image
                src="/IMG_5243.JPG"
                alt={`${siteConfig.name} — profile photo`}
                fill
                priority
                sizes="(max-width: 768px) 80vw, 400px"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/65 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
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
