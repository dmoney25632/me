import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/data/site";
import { Section } from "./Section";
import { GithubIcon } from "./icons";

function primaryHref(p: Project) {
  return p.liveUrl ?? p.githubUrl;
}

function SourceLink({ project }: { project: Project }) {
  if (!project.githubUrl || !project.liveUrl) return null;
  return (
    <a
      href={project.githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-10 inline-flex items-center gap-1 font-mono text-[11px] text-subtle transition-colors hover:text-accent"
    >
      <GithubIcon className="h-3 w-3" />
      source
    </a>
  );
}

/** Big card for the projects marked `featured`. */
function FeaturedCard({ project }: { project: Project }) {
  const href = primaryHref(project);
  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-surface/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface/80 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
          {project.kind}
        </span>
        <span className="font-mono text-[11px] text-subtle">{project.period}</span>
      </div>
      <h3 className="mt-3 flex items-center gap-1 text-lg font-semibold tracking-tight">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0">
            {project.title}
          </a>
        ) : (
          project.title
        )}
        {href && (
          <ArrowUpRight className="h-4 w-4 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        )}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {project.tech.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
        <span className="ml-auto">
          <SourceLink project={project} />
        </span>
      </div>
    </article>
  );
}

/** Compact row for everything else. */
function ProjectRow({ project }: { project: Project }) {
  const href = primaryHref(project);
  return (
    <article className="group relative -mx-4 rounded-xl px-4 py-4 transition-colors hover:bg-surface/70">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="flex items-center gap-1 font-semibold tracking-tight">
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0">
              {project.title}
            </a>
          ) : (
            project.title
          )}
          {href && (
            <ArrowUpRight className="h-3.5 w-3.5 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          )}
          <span className="ml-2 hidden font-mono text-[11px] font-normal text-subtle sm:inline">
            {project.kind}
          </span>
        </h3>
        <p className="shrink-0 font-mono text-xs text-subtle">{project.period}</p>
      </div>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{project.description}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="font-mono text-xs text-subtle">{project.tech.join(" · ")}</p>
        <SourceLink project={project} />
      </div>
    </article>
  );
}

export function Projects() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Section id="projects" index="03" title="Other projects">
      <div className="grid gap-4 sm:grid-cols-2">
        {featured.map((p) => (
          <FeaturedCard key={p.id} project={p} />
        ))}
      </div>
      <div className="mt-8 space-y-1">
        {rest.map((p) => (
          <ProjectRow key={p.id} project={p} />
        ))}
      </div>
    </Section>
  );
}
