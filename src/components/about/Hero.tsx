"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Gamepad2, MapPin } from "lucide-react";
import { useRef } from "react";
import { GitHubIcon, XIcon } from "@/components/ui/brand-icons";
import { game, hero, me } from "@/content";
import { EASE_OUT, Reveal, SplitWords } from "@/components/ui/motion";
import { pill } from "@/components/ui/styles";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const archY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);
  const innerScale = useTransform(scrollYProgress, [0, 1], [1.08, reduce ? 1.08 : 1.2]);

  return (
    <section id="top" ref={ref} className="relative">
      <div className="px-5 sm:px-8">
        <div className="mx-auto grid min-h-[100svh] max-w-6xl items-center gap-12 pt-28 pb-16 md:grid-cols-[1.15fr_1fr] md:gap-16 md:pt-24">
          <div className="order-2 md:order-1">
            <Reveal delay={0.1} className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-mint px-3 py-1 font-mono text-[13px] tracking-tight text-mint-ink">
                {hero.badge}
              </span>
              <span className="flex items-center gap-1 font-mono text-[13px] text-ink/60">
                <MapPin className="size-3.5" /> {me.location}
              </span>
            </Reveal>

            <SplitWords
              words={hero.headline}
              delay={0.25}
              className="display mt-6 text-[clamp(3.1rem,8.6vw,6.2rem)] text-ink"
            />

            <Reveal delay={0.8} className="mt-6 max-w-md text-[17px] leading-relaxed text-pretty text-ink/80">
              {hero.sub}
            </Reveal>

            <Reveal delay={1} className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#projects" className={`${pill} group h-12 bg-ink-2 px-6 text-[15px] text-paper`}>
                See the work
                <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
              </a>
              <a
                href={me.links.github}
                target="_blank"
                rel="noreferrer"
                className={`${pill} h-12 px-5 text-[15px] text-ink ring-1 ring-line hover:bg-paper-2`}
              >
                <GitHubIcon className="size-4" /> GitHub
              </a>
              <a
                href={me.links.x}
                target="_blank"
                rel="noreferrer"
                aria-label="Follow @daytonrunyan on X"
                className={`${pill} h-12 px-5 text-[15px] text-ink ring-1 ring-line hover:bg-paper-2`}
              >
                <XIcon className="size-3.5" /> Follow
              </a>
              <a
                href="#play"
                className={`${pill} h-12 bg-glow px-5 text-[15px] text-ink-2`}
                title={`Play ${game.name}`}
              >
                <Gamepad2 className="size-4" /> Play my game
              </a>
            </Reveal>
          </div>

          <motion.div
            style={{ y: archY }}
            className="order-1 mx-auto w-[min(64vw,300px)] md:order-2 md:mr-5 md:w-full md:max-w-[400px]"
          >
            <div className="relative">
              {/* brass outline arch behind the photo */}
              <svg
                viewBox="0 0 300 400"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full translate-x-3 translate-y-3 overflow-visible md:translate-x-5 md:translate-y-5"
                aria-hidden
              >
                <motion.path
                  d="M4 396 L4 150 A146 146 0 0 1 296 150 L296 396 Z"
                  fill="none"
                  stroke="var(--brass)"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.8, ease: EASE_OUT, delay: 0.9 }}
                />
              </svg>

              <motion.div
                initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0% round 999px 999px 8px 8px)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0% round 999px 999px 8px 8px)" }}
                transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.2 }}
                className="arch relative aspect-[3/4] overflow-hidden bg-sky shadow-[0_30px_60px_-30px_rgb(52_41_31/0.55)]"
              >
                <motion.div style={{ scale: innerScale, originY: 0.3 }} className="absolute inset-0">
                  <Image
                    src={hero.portrait.src}
                    alt={hero.portrait.alt}
                    fill
                    priority
                    className="object-cover object-[50%_30%]"
                    sizes="(min-width: 768px) 400px, 64vw"
                  />
                </motion.div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#34291f]/25 via-transparent to-[#f6dfa4]/10 mix-blend-multiply" />
                <div className="arch pointer-events-none absolute inset-[8px] ring-1 ring-white/45" />
              </motion.div>

              {/* seal */}
              <motion.div
                initial={reduce ? false : { scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 1.2 }}
                className="absolute bottom-[14%] -left-5 size-[86px] md:-left-9 md:size-[112px]"
              >
                <div className="relative grid size-full place-items-center rounded-full bg-paper shadow-[0_14px_30px_-14px_rgb(0_0_0/0.4)] ring-1 ring-line">
                  <svg viewBox="0 0 100 100" className="seal absolute inset-0 size-full" aria-hidden>
                    <defs>
                      <path id="sealPath" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
                    </defs>
                    <text fontFamily="var(--font-geist-mono)" fontSize="8.4" letterSpacing="2.2" fill="var(--ink)">
                      <textPath href="#sealPath">{hero.seal}</textPath>
                    </text>
                  </svg>
                  <span className="foil display text-[26px] leading-none md:text-[32px]">{me.initials}</span>
                </div>
              </motion.div>
            </div>

            <Reveal
              delay={1.2}
              className="mt-6 flex items-center justify-between font-mono text-[12px] text-ink/60 md:mt-8"
            >
              <span>{me.title}</span>
              <span>Est. {hero.est}</span>
            </Reveal>
          </motion.div>
        </div>
      </div>

      {/* stack marquee */}
      <div className="relative overflow-hidden border-y border-line bg-paper-2/60 py-4">
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {[...hero.marquee, ...hero.marquee].map((s, i) => (
            <span
              key={i}
              className="display flex items-center gap-10 text-2xl text-ink/80"
              aria-hidden={i >= hero.marquee.length}
            >
              {s} <span className="text-brass">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
