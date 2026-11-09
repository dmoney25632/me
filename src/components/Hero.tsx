"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Logo } from "./Logo";
import { Wordmark } from "./Wordmark";
import { GithubIcon, LinkedinIcon, XIcon } from "./icons";

const socials = [
  { name: "GitHub", href: siteConfig.socials.github, icon: GithubIcon },
  { name: "LinkedIn", href: siteConfig.socials.linkedin, icon: LinkedinIcon },
  { name: "X", href: siteConfig.socials.twitter, icon: XIcon },
];

const fade = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: "easeOut" as const, delay: 0.1 + i * 0.08 },
});

export function Hero() {
  return (
    <section id="top" className="relative -mt-14 overflow-hidden pt-14">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-grid absolute inset-0" />
        <div className="hero-glow absolute inset-0" />
      </div>

      <div className="container-narrow pb-14 pt-14 sm:pb-20 sm:pt-24">
        <div className="flex flex-col-reverse gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-lg">
            <motion.a
              {...fade(0)}
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 py-1 pl-2.5 pr-3 text-xs text-muted backdrop-blur transition-colors hover:border-accent/50 hover:text-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-soft absolute inline-flex h-full w-full rounded-full bg-accent" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {siteConfig.status}
            </motion.a>

            <h1 className="mt-6">
              <Wordmark animate className="text-[clamp(2.75rem,14vw,5.25rem)]" />
            </h1>

            <motion.p {...fade(2)} className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">
              <span className="font-medium text-foreground">Founder</span> of
              Evrcad, studying{" "}
              <span className="font-medium text-foreground">Information Systems</span>{" "}
              at BYU.
            </motion.p>

            <motion.p {...fade(3)} className="mt-4 leading-relaxed text-muted">
              {siteConfig.intro}
            </motion.p>

            <motion.div {...fade(4)} className="mt-8 flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
              >
                <Mail className="h-4 w-4" />
                Get in touch
              </a>
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    title={s.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/70 text-muted transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 110, damping: 16, delay: 0.2 }}
            className="relative shrink-0 sm:mt-10"
          >
            <div className="group relative h-36 w-36 sm:h-44 sm:w-44">
              <div className="absolute -inset-3 rounded-[2rem] bg-accent/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative h-full w-full overflow-hidden rounded-3xl border border-border shadow-xl shadow-black/5 transition-transform duration-500 group-hover:rotate-2 group-hover:scale-[1.02] dark:shadow-black/40">
                <Image
                  src="/IMG_5243.JPG"
                  alt={`${siteConfig.name} — profile photo`}
                  fill
                  priority
                  sizes="176px"
                  className="object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background shadow-lg shadow-black/5">
                <Logo className="h-8 w-8 text-foreground" />
              </div>
            </div>
            <p className="mt-6 hidden items-center gap-1.5 text-xs text-subtle sm:flex">
              <MapPin className="h-3.5 w-3.5" />
              {siteConfig.location}
            </p>
          </motion.div>
        </div>

        <motion.a
          {...fade(6)}
          href="#experience"
          aria-label="Scroll to experience"
          className="mt-14 hidden h-9 w-9 items-center justify-center rounded-full border border-border text-subtle transition-colors hover:text-foreground sm:flex"
        >
          <ArrowDown className="h-4 w-4" />
        </motion.a>
      </div>
    </section>
  );
}
