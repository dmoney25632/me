"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { projects, type Project, type ProjectCategory } from "@/data/site";
import { SectionHeading } from "./SectionHeading";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

const filters: ProjectCategory[] = ["All", "SaaS", "AI", "Tools", "Other"];

export function Projects() {
  const [active, setActive] = useState<ProjectCategory>("All");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(
    () =>
      active === "All"
        ? projects
        : projects.filter((p) => p.category === active),
    [active],
  );

  return (
    <section id="projects" className="section-pad relative">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Selected Work"
          title="Projects that ship."
          description="SaaS products, AI tooling, and systems built from real operational needs — not demos."
        />

        <LayoutGroup>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="mb-10 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter projects by category"
          >
            {filters.map((filter) => {
              const isActive = active === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(filter)}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                    isActive
                      ? "text-[#050505]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="project-filter"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{filter}</span>
                </button>
              );
            })}
          </motion.div>

          <motion.div
            layout
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  onOpen={setSelected}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
