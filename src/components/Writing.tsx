import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { essays, essayHref, formatDate, type Essay } from "@/data/writing";
import { Section } from "./Section";

export function EssayRow({ essay }: { essay: Essay }) {
  const href = essayHref(essay);
  const external = Boolean(essay.externalUrl);
  const Anchor = external ? "a" : Link;

  return (
    <li className="group relative -mx-4 rounded-xl px-4 py-4 transition-colors hover:bg-surface/70">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h3 className="flex items-center gap-1.5 font-semibold tracking-tight">
          <Anchor
            href={href}
            className="after:absolute after:inset-0"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {essay.title}
          </Anchor>
          {external && (
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          )}
          {essay.draft && <span className="chip !text-[10px]">draft</span>}
        </h3>
        <p className="shrink-0 font-mono text-xs text-subtle">
          {essay.publication && <span>{essay.publication} · </span>}
          {formatDate(essay.date)}
        </p>
      </div>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{essay.summary}</p>
    </li>
  );
}

/** Home-page section: the latest few essays. */
export function Writing({ limit = 4 }: { limit?: number }) {
  const shown = essays.slice(0, limit);

  return (
    <Section id="writing" index="02" title="Writing">
      {shown.length === 0 ? (
        <p className="text-muted">
          Essays on building, AI, and running a business. First ones are on the way.
        </p>
      ) : (
        <ul className="space-y-1">
          {shown.map((e) => (
            <EssayRow key={e.slug} essay={e} />
          ))}
        </ul>
      )}
      {essays.length > limit && (
        <Link
          href="/writing"
          className="mt-6 inline-flex items-center gap-1 font-mono text-xs text-subtle transition-colors hover:text-accent"
        >
          all {essays.length} essays →
        </Link>
      )}
    </Section>
  );
}
