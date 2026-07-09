"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "./SectionHeading";
import { GithubIcon, LinkedinIcon, XIcon } from "./icons";

const socials = [
  {
    name: "GitHub",
    href: siteConfig.socials.github,
    icon: GithubIcon,
  },
  {
    name: "X / Twitter",
    href: siteConfig.socials.twitter,
    icon: XIcon,
  },
  {
    name: "LinkedIn",
    href: siteConfig.socials.linkedin,
    icon: LinkedinIcon,
  },
];

export function Connect() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      setCopied(true);
      toast.success("Email copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy email — try selecting it manually");
    }
  };

  return (
    <section id="connect" className="section-pad relative">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Connect"
          title="Let's build something."
          description="Open to collaborations, interesting problems, and conversations about SaaS, ops, and AI."
          align="center"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mx-auto max-w-3xl"
        >
          <button
            type="button"
            onClick={copyEmail}
            className="group mx-auto flex w-full max-w-xl items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 backdrop-blur-2xl transition-all duration-300 hover:border-accent/35 hover:shadow-[0_0_40px_rgba(0,245,255,0.1)]"
            aria-label={`Copy email ${siteConfig.email}`}
          >
            <span className="break-all text-xl font-medium tracking-tight text-white transition-colors group-hover:text-accent sm:text-2xl md:text-3xl">
              {siteConfig.email}
            </span>
            <span className="shrink-0 text-accent">
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5 opacity-60 transition-opacity group-hover:opacity-100" />
              )}
            </span>
          </button>

          <div className="mt-8 flex items-center justify-center gap-3">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition-all duration-300 hover:border-accent/40 hover:text-accent hover:shadow-[0_0_24px_rgba(0,245,255,0.15)]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
