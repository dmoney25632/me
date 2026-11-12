import type { ReactNode } from "react";

// A deliberately tiny Markdown renderer for essays in src/data/writing.ts.
// Supports: paragraphs, ## / ### headings, > quotes, - lists, 1. lists,
// --- rules, **bold**, *italic*, `code`, [text](url).

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string, keyBase: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
      return <strong key={key} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return (
        <code key={key} className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
          {part.slice(1, -1)}
        </code>
      );
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const external = /^https?:/.test(link[2]);
      return (
        <a
          key={key}
          href={link[2]}
          className="link"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {link[1]}
        </a>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return <em key={key}>{part.slice(1, -1)}</em>;
    return part;
  });
}

export function Prose({ source }: { source: string }) {
  const blocks = source.trim().split(/\n\s*\n/);

  return (
    <div className="space-y-5 text-[17px] leading-[1.75] text-muted">
      {blocks.map((raw, i) => {
        const block = raw.trim();
        const k = `b${i}`;
        const lines = block.split("\n").map((l) => l.trim());

        if (block === "---") return <hr key={k} className="!my-10 border-border" />;
        if (block.startsWith("### "))
          return (
            <h3 key={k} className="!mt-9 text-lg font-semibold tracking-tight text-foreground">
              {inline(block.slice(4), k)}
            </h3>
          );
        if (block.startsWith("## "))
          return (
            <h2 key={k} className="!mt-11 text-2xl font-semibold tracking-tight text-foreground">
              {inline(block.slice(3), k)}
            </h2>
          );
        if (lines.every((l) => l.startsWith(">")))
          return (
            <blockquote
              key={k}
              className="border-l-2 border-accent pl-5 font-display text-2xl italic leading-snug text-foreground"
            >
              {inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), k)}
            </blockquote>
          );
        if (lines.every((l) => /^[-*]\s/.test(l)))
          return (
            <ul key={k} className="list-disc space-y-1.5 pl-5 marker:text-accent">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2), `${k}-${j}`)}</li>
              ))}
            </ul>
          );
        if (lines.every((l) => /^\d+\.\s/.test(l)))
          return (
            <ol key={k} className="list-decimal space-y-1.5 pl-5 marker:font-mono marker:text-sm marker:text-accent">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\d+\.\s/, ""), `${k}-${j}`)}</li>
              ))}
            </ol>
          );
        return <p key={k}>{inline(lines.join(" "), k)}</p>;
      })}
    </div>
  );
}
