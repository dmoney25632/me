"use client";

import { motion } from "framer-motion";
import {
  Boxes,
  Brain,
  Cloud,
  Code2,
  Database,
  GitBranch,
  Languages,
  Layout,
  Shield,
  Sparkles,
  Terminal,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { skillCategories, skills } from "@/data/site";
import { SectionHeading } from "./SectionHeading";

const iconMap: Record<string, LucideIcon> = {
  TypeScript: Code2,
  "Next.js": Layout,
  React: Boxes,
  "Tailwind CSS": Sparkles,
  "Framer Motion": Sparkles,
  Python: Terminal,
  Supabase: Database,
  PostgreSQL: Database,
  Vercel: Cloud,
  "REST APIs": Cloud,
  "OpenAI / Gemini": Brain,
  "Workflow Automation": Workflow,
  "Prompt Engineering": Brain,
  "Data Pipelines": Workflow,
  "Git & GitHub": GitBranch,
  Cybersecurity: Shield,
  Operations: Users,
  "Client Management": Users,
  "Spanish (Professional)": Languages,
};

export function Skills() {
  return (
    <section id="skills" className="section-pad relative">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Capabilities"
          title="Skills & technologies"
          description="A practical stack shaped by shipping products and running real businesses."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {skillCategories.map((category, ci) => {
            const items = skills.filter((s) => s.category === category);
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: ci * 0.06,
                }}
                className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-2xl sm:p-8"
              >
                <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                  {category}
                </h3>
                <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {items.map((skill) => {
                    const Icon = iconMap[skill.name] ?? Code2;
                    return (
                      <li key={skill.name}>
                        <div className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-300 hover:border-white/8 hover:bg-white/[0.04]">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03] text-zinc-400 transition-colors group-hover:border-accent/30 group-hover:text-accent">
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="text-sm text-zinc-300 group-hover:text-white">
                            {skill.name}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
