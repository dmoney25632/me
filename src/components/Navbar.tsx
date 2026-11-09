"use client";

import { useEffect, useState } from "react";
import { navLinks, siteConfig } from "@/data/site";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [active, setActive] = useState<string | null>(null);

  // Highlight the nav link for the section currently in view.
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.querySelector<HTMLElement>(l.href))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="container-narrow flex h-14 items-center justify-between gap-4">
        <a
          href="#top"
          className="group flex shrink-0 items-center gap-2"
          aria-label={`${siteConfig.name} — home`}
        >
          <Logo className="h-7 w-7 text-foreground transition-transform duration-300 group-hover:-rotate-6" />
          <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">
            {siteConfig.name}
            <span className="text-accent">.</span>
          </span>
        </a>

        <div className="flex items-center gap-1 sm:gap-3">
          <ul className="flex items-center gap-0.5 sm:gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`rounded-md px-1.5 py-1 text-[13px] transition-colors sm:px-2 sm:text-sm ${
                    active === link.href
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
