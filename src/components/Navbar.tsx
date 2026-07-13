"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks, siteConfig } from "@/data/site";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const scrollTo = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-[#050505]/70 backdrop-blur-2xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="container-narrow flex h-16 items-center justify-between md:h-20">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex items-center gap-2.5"
            aria-label={`${siteConfig.name} — home`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 font-mono text-sm font-semibold tracking-tight text-accent transition-all duration-300 group-hover:glow-accent-sm group-hover:border-accent/60">
              {siteConfig.monogram}
            </span>
            <span className="hidden text-sm font-medium tracking-tight text-zinc-200 sm:block">
              {siteConfig.name}
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href);
                  }}
                  className="rounded-lg px-3.5 py-2 text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-300 transition-all duration-300 hover:border-white/30 hover:text-white"
            >
              Resume
            </a>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-300 transition-colors hover:border-white/20 hover:text-white md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-[#050505]/95 backdrop-blur-2xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="container-narrow flex h-16 items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 font-mono text-sm font-semibold text-accent">
                {siteConfig.monogram}
              </span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-300"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <motion.nav
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.05 }}
              className="container-narrow flex flex-col gap-2 pt-10"
            >
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 160,
                    damping: 22,
                    delay: 0.08 + i * 0.05,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href);
                  }}
                  className="rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4 text-2xl font-medium tracking-tight text-white transition-colors hover:border-accent/30 hover:text-accent"
                >
                  {link.label}
                </motion.a>
              ))}

              <div className="mt-8 flex flex-col gap-3">
                <a
                  href={siteConfig.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-5 py-3.5 text-center text-sm text-zinc-300"
                >
                  Resume
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
