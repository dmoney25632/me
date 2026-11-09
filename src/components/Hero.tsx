"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Logo } from "./Logo";
import { GithubIcon, LinkedinIcon, XIcon } from "./icons";

const socials = [
  { name: "GitHub", href: siteConfig.socials.github, icon: GithubIcon },
  { name: "LinkedIn", href: siteConfig.socials.linkedin, icon: LinkedinIcon },
  { name: "X", href: siteConfig.socials.twitter, icon: XIcon },
];

const fade = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const, delay: 0.15 + i * 0.08 },
});

export function Hero() {
  return (
    <section id="top" className="pb-8 pt-16 sm:pb-12 sm:pt-24">
      <div className="container-narrow flex flex-col-reverse gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <motion.div {...fade(0)} className="mb-6">
            <Logo animate className="h-14 w-14 text-foreground" />
          </motion.div>

          <motion.h1
            {...fade(1)}
            className="text-4xl font-bold tracking-tight sm:text-5xl"
          >
            {siteConfig.name}
            <span className="text-accent">.</span>
          </motion.h1>

          <motion.p {...fade(2)} className="mt-4 text-lg leading-relaxed text-muted">
            <span className="font-semibold text-foreground">Founder</span> of
            Evrcad, studying{" "}
            <span className="font-semibold text-foreground">
              Information Systems
            </span>{" "}
            at BYU.
          </motion.p>

          <motion.p {...fade(3)} className="mt-5 leading-relaxed text-muted">
            {siteConfig.intro}
          </motion.p>

          <motion.div {...fade(4)} className="mt-8 flex flex-wrap gap-2">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {s.name}
                </a>
              );
            })}
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-border sm:mt-2"
        >
          <Image
            src="/IMG_5243.JPG"
            alt={`${siteConfig.name} — profile photo`}
            fill
            priority
            sizes="144px"
            className="object-cover object-top"
          />
        </motion.div>
      </div>
    </section>
  );
}
