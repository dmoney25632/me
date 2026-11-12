import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Prose } from "@/components/Prose";
import { essays, formatDate, getEssay, readingTime } from "@/data/writing";
import { siteConfig } from "@/data/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return essays.filter((e) => e.body).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const essay = getEssay((await params).slug);
  if (!essay) return {};
  return {
    title: essay.title,
    description: essay.summary,
    openGraph: { type: "article", title: essay.title, description: essay.summary, publishedTime: essay.date },
  };
}

export default async function EssayPage({ params }: { params: Promise<{ slug: string }> }) {
  const essay = getEssay((await params).slug);
  if (!essay?.body) notFound();

  return (
    <PageShell>
      <article className="container-narrow py-16 sm:py-24">
        <Link
          href="/writing"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-subtle transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          writing
        </Link>
        <header className="mt-8 border-b border-border pb-8">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{essay.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{essay.summary}</p>
          <p className="mt-5 font-mono text-xs text-subtle">
            {siteConfig.name} · {formatDate(essay.date)} · {readingTime(essay.body)}
            {essay.draft && <span className="ml-2 chip !text-[10px]">draft</span>}
          </p>
        </header>
        <div className="mt-10">
          <Prose source={essay.body} />
        </div>
        <footer className="mt-16 border-t border-border pt-8">
          <Link href="/writing" className="link text-sm">
            ← More writing
          </Link>
        </footer>
      </article>
    </PageShell>
  );
}
