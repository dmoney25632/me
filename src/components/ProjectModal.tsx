"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import type { Project } from "@/data/site";
import { GithubIcon } from "./icons";
interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
        >
          <motion.button
            type="button"
            aria-label="Close project details"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
            className="relative z-10 flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0a0a0a]/95 shadow-[0_0_80px_rgba(0,245,255,0.08)] backdrop-blur-2xl sm:rounded-3xl"
          >
            <div className="relative aspect-[16/9] w-full shrink-0">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-xl transition-colors hover:border-accent/40 hover:text-accent"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 pb-8 pt-2 sm:px-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {project.category}
              </p>
              <h3
                id="project-modal-title"
                className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
              >
                {project.title}
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
                {project.longDescription}
              </p>

              <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  What I learned
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {project.learned}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[#050505] transition-all hover:glow-accent-sm hover:brightness-110"
                  >
                    Live site
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
