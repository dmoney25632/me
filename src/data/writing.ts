// Essays and articles. Add one by appending to `essays`.
//
// Two kinds:
//   1. Hosted here — write the essay in `body` (simple Markdown: paragraphs,
//      ## headings, > quotes, - lists, **bold**, *italic*, `code`, [links](url)).
//      It gets its own page at /writing/<slug>.
//   2. Published elsewhere (Substack, X, LinkedIn…) — set `externalUrl` and
//      leave `body` out. The list links straight to it.
//
// `draft: true` shows the essay when running locally (`npm run dev`) and hides
// it on the live site.

export interface Essay {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-11-12". */
  date: string;
  summary: string;
  body?: string;
  externalUrl?: string;
  /** e.g. "Substack", "X". Shown next to external essays. */
  publication?: string;
  draft?: boolean;
}

const all: Essay[] = [
  {
    slug: "how-to-add-an-essay",
    title: "How to add an essay to this site",
    date: "2026-11-12",
    summary:
      "A placeholder that only shows up locally. Replace it with a real essay.",
    draft: true,
    body: `This is a draft, so it only appears when you run the site locally. Delete it once a real essay is in.

## Adding one

Open \`src/data/writing.ts\` and add an entry to the list. Give it a \`slug\`, a \`title\`, a \`date\` and a one-line \`summary\`.

- Write the essay in \`body\` to host it here.
- Or set \`externalUrl\` to link to Substack, X, or anywhere else.

> Paragraphs are separated by a blank line. That's most of the formatting you need.

**Bold**, *italic*, \`code\` and [links](https://ftr42.com) all work inline.`,
  },
];

export const essays: Essay[] = all
  .filter((e) => !e.draft || process.env.NODE_ENV !== "production")
  .sort((a, b) => b.date.localeCompare(a.date));

export function getEssay(slug: string) {
  return essays.find((e) => e.slug === slug && e.body);
}

export function essayHref(e: Essay) {
  return e.externalUrl ?? `/writing/${e.slug}`;
}

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Rough reading time for hosted essays. */
export function readingTime(body: string) {
  const words = body.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 230))} min read`;
}
