import { experience } from "@/data/site";
import { Section, TimelineRow } from "./Section";

export function Experience() {
  return (
    <Section id="experience" title="Experience">
      <div className="space-y-8">
        {experience.map((job) => (
          <TimelineRow key={`${job.company}-${job.period}`} period={job.period}>
            <h3 className="font-semibold tracking-tight">
              {job.role}
              <span className="font-normal text-subtle"> · {job.company}</span>
            </h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
              {job.description}
            </p>
          </TimelineRow>
        ))}
      </div>
    </Section>
  );
}
