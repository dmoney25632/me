import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { EssayRow } from "@/components/Writing";
import { essays } from "@/data/writing";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and articles by Dayton Runyan on building, AI, and running a business.",
};

export default function WritingIndex() {
  return (
    <PageShell>
      <div className="container-narrow py-16 sm:py-24">
        <p className="font-mono text-xs text-accent">~/writing</p>
        <h1 className="mt-3 font-display text-5xl italic tracking-tight sm:text-6xl">Writing.</h1>
        <p className="mt-4 max-w-lg leading-relaxed text-muted">
          Essays on building companies, AI that does real work, and what I&apos;m learning along the way.
        </p>
        {essays.length === 0 ? (
          <p className="mt-12 text-muted">Nothing published yet. Soon.</p>
        ) : (
          <ul className="mt-12 space-y-1">
            {essays.map((e) => (
              <EssayRow key={e.slug} essay={e} />
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
