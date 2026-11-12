import { experience } from "@/data/site";
import { Section } from "./Section";

export function Experience() {
  return (
    <Section id="experience" index="04" title="Experience">
      <ol className="relative ml-1.5 border-l border-border">
        {experience.map((job, i) => (
          <li key={`${job.company}-${job.period}`} className="relative pb-10 pl-7 last:pb-0">
            <span
              className={`absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full border-2 border-background ${
                i === 0 ? "bg-accent ring-4 ring-accent/15" : "bg-subtle"
              }`}
            />
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h3 className="font-semibold tracking-tight">
                {job.role}
                <span className="font-normal text-muted"> · {job.company}</span>
              </h3>
              <p className="shrink-0 font-mono text-xs text-subtle">{job.period}</p>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{job.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
