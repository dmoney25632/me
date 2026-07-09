"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/site";

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  index: number;
}

export function ProjectCard({ project, onOpen, index }: ProjectCardProps) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        delay: index * 0.04,
      }}
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={() => onOpen(project)}
      className="group relative flex w-full flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] text-left backdrop-blur-2xl transition-shadow duration-500 hover:border-accent/30 hover:shadow-[0_0_40px_rgba(0,245,255,0.12)] focus-visible:outline-none"
      aria-label={`View details for ${project.title}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent opacity-80" />
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
        <span className="absolute bottom-3 left-3 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-accent backdrop-blur-md">
          {project.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-400">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-zinc-500"
            >
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="rounded-full px-2 py-0.5 text-[11px] text-zinc-600">
              +{project.tech.length - 4}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
