import { GraduationCap, ShieldCheck } from "lucide-react";
import { education } from "@/data/site";
import { Section } from "./Section";

const icons = { school: GraduationCap, cert: ShieldCheck };

export function Education() {
  return (
    <Section id="education" index="05" title="Education">
      <div className="grid gap-4 sm:grid-cols-2">
        {education.map((item) => {
          const Icon = icons[item.type];
          return (
            <div
              key={item.school}
              className="flex gap-4 rounded-2xl border border-border bg-surface/40 p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold tracking-tight">{item.school}</h3>
                <p className="mt-0.5 text-sm text-muted">{item.detail}</p>
                <p className="mt-2 font-mono text-xs text-subtle">{item.period}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
