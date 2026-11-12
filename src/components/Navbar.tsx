"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, siteConfig } from "@/data/site";
import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the home page, highlight the link for the section currently in view.
  useEffect(() => {
    if (pathname !== "/") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`/#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    navLinks.forEach((l) => {
      const el = document.getElementById(l.href.split("#")[1]);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === "/" ? active === href : href === "/#writing" && pathname.startsWith("/writing");

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled
          ? "border-b border-border bg-background/75 backdrop-blur-lg"
          : "border-b border-transparent"
      }`}
    >
      <nav className="container-narrow flex h-14 items-center justify-between gap-4">
        <Link
          href="/#top"
          className="shrink-0 transition-opacity hover:opacity-75"
          aria-label={`${siteConfig.name} — home`}
        >
          <Wordmark className="text-[26px]" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ul className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    isActive(link.href) ? "text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute inset-x-2.5 -bottom-px h-px bg-accent transition-opacity ${
                      isActive(link.href) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/net"
            title="What your browser tells me about you"
            className={`rounded-md border px-2 py-1 font-mono text-xs transition-colors ${
              pathname === "/net"
                ? "border-accent/50 text-accent"
                : "border-border text-muted hover:border-accent/50 hover:text-accent"
            }`}
          >
            ~/net
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
