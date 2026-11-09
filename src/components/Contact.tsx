"use client";

import { Check, Copy } from "lucide-react";
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
    <Section id="contact" title="Contact">
      <p className="text-[15px] leading-relaxed text-muted">
        Always down to talk about SaaS, AI, or a problem worth solving. Reach
        out anytime.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <a href={`mailto:${siteConfig.email}`} className="link text-lg font-medium">
          {siteConfig.email}
        </a>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy email address"
          className="flex h-8 w-8 items-center justify-center rounded-md text-subtle transition-colors hover:text-accent"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </Section>
  );
}
