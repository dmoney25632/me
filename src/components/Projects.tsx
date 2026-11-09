import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/site";
import { Section } from "./Section";
import { GithubIcon } from "./icons";

export function Projects() {
  return (
    <Section id="projects" title="Projects / Ventures">
      <div className="space-y-10">
        {projects.map((project) => {
          const href = project.liveUrl ?? project.githubUrl;
          return (
            <article key={project.id} className="group">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-semibold tracking-tight">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 transition-colors hover:text-accent"
                    >
                      {project.title}
                      <ArrowUpRight className="h-3.5 w-3.5 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ) : (
                    project.title
                  )}
                </h3>
                <p className="shrink-0 font-mono text-xs text-subtle">
                  {project.period}
                </p>
              </div>

              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                {project.description}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-mono text-xs text-subtle">
                  {project.tech.join(" · ")}
                </p>
                {project.githubUrl && project.liveUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-subtle transition-colors hover:text-accent"
                  >
                    <GithubIcon className="h-3 w-3" />
                    source
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
