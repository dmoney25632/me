"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SquareTerminal } from "lucide-react";
import { GitHubIcon, XIcon } from "@/components/ui/brand-icons";
import { me } from "@/content";
import { ScrollProgress } from "@/components/ui/motion";
import { pill } from "@/components/ui/styles";

export const SECTIONS = [
  { id: "about", label: "About" },
  { id: "companies", label: "Companies" },
  { id: "projects", label: "Projects" },
  { id: "play", label: "Play" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Links" },
] as const;

function useActive() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return scrolled;
}


export function ProfileNav() {
  const active = useActive();
  const scrolled = useScrolled();
  const { github, x: twitter } = me.links;

  return (
    <>
      <ScrollProgress className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-gradient-to-r from-brass via-maroon to-brass" />
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
        <div
          className={`mx-auto flex max-w-[calc(72rem+2.5rem)] items-center justify-between rounded-2xl px-2 py-2.5 transition-[background-color,box-shadow] duration-500 sm:px-5 ${
            scrolled ? "bg-paper/80 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.35)] ring-1 ring-line backdrop-blur-xl" : ""
          }`}
        >
          <a href="#top" className="display text-[22px] text-ink">
            {me.name}
          </a>

          <nav className="hidden items-center gap-1 text-[13px] lg:flex">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`rounded-full px-3.5 py-1.5 transition-colors hover:text-ink ${
                  active === s.id ? "bg-paper-3/70 text-ink" : "text-ink/65"
                }`}
              >
                {s.label}
              </a>
            ))}
            <Link
              href="/lab"
              className="ml-1 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-ink/65 transition-colors hover:text-ink"
            >
              <span className="size-1.5 rounded-full bg-[#e0662f] shadow-[0_0_0_3px_rgb(224_102_47/0.18)]" />
              Lab
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={twitter}
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className={`${pill} bg-black px-3 text-white sm:px-4`}
            >
              <XIcon className="size-3.5" />
              <span className="hidden sm:inline">Follow</span>
            </a>
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              className={`${pill} bg-ink-2 text-paper shadow-[0_6px_16px_-8px_rgb(0_0_0/0.6)]`}
            >
              <GitHubIcon className="size-4" />
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* phone dock */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 px-3 lg:hidden">
        <nav className="paper-dock pointer-events-auto mx-auto flex max-w-md items-center gap-1 rounded-[1.15rem] p-1.5 text-[13px] text-white/80">
          {SECTIONS.slice(0, 4).map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`flex h-11 flex-1 items-center justify-center rounded-xl transition-colors ${
                active === s.id ? "bg-white/15 text-white" : ""
              }`}
            >
              {s.label}
            </a>
          ))}
          <Link
            href="/"
            aria-label="Terminal"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-black text-white"
          >
            <SquareTerminal className="size-4" />
          </Link>
        </nav>
      </div>
    </>
  );
}
