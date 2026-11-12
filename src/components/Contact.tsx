"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { siteConfig } from "@/data/site";
import { Section } from "./Section";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      setCopied(true);
      toast.success("Email copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — try selecting it instead");
    }
  };

  return (
    <Section id="contact" index="06" title="Contact">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/40 p-7 sm:p-10">
        <div aria-hidden className="hero-glow pointer-events-none absolute inset-0" />
        <div className="relative">
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Let&apos;s build something<span className="text-accent">.</span>
          </h3>
          <p className="mt-3 max-w-md leading-relaxed text-muted">
            Always down to talk about SaaS, AI, or a problem worth solving. My
            inbox is open.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              {siteConfig.email}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}
