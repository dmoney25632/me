import { education } from "@/data/site";
import { Section, TimelineRow } from "./Section";

export function Education() {
  return (
    <Section id="education" title="Education">
      <div className="space-y-8">
        {education.map((item) => (
          <TimelineRow key={item.school} period={item.period}>
            <h3 className="font-semibold tracking-tight">{item.school}</h3>
            <p className="mt-0.5 text-[15px] text-foreground/80">{item.detail}</p>
            {item.note && (
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                {item.note}
              </p>
            )}
          </TimelineRow>
        ))}
      </div>
    </Section>
  );
}
