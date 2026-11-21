"use client";

import type { ReactNode } from "react";
import type { Block, ImageRef, Span, Tone } from "@/lib/terminal/types";

export const TONE: Record<Tone, string> = {
  fg: "text-t-fg",
  muted: "text-t-muted",
  green: "text-t-green",
  blue: "text-t-blue font-semibold",
  cyan: "text-t-cyan",
  yellow: "text-t-yellow",
  magenta: "text-t-magenta",
  red: "text-t-red",
  bold: "font-bold text-white",
};

type RunFn = (cmd: string) => void;

const clickable =
  "cursor-pointer underline decoration-transparent underline-offset-[3px] transition-colors hover:decoration-current";

function SpanView({ span, onRun }: { span: Span; onRun: RunFn }) {
  const cls = span.tone ? TONE[span.tone] : "";
  if (span.cmd)
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRun(span.cmd!);
        }}
        className={`${cls} ${clickable} text-left`}
        title={`run: ${span.cmd}`}
      >
        {span.text}
      </button>
    );
  if (span.href) {
    const external = /^https?:/.test(span.href);
    return (
      <a
        href={span.href}
        onClick={(e) => e.stopPropagation()}
        className={`${cls} underline decoration-current/40 underline-offset-[3px] hover:decoration-current`}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {span.text}
      </a>
    );
  }
  return <span className={cls}>{span.text}</span>;
}

function Line({ spans, onRun }: { spans: Span[]; onRun: RunFn }) {
  if (!spans.length || (spans.length === 1 && !spans[0].text)) return <div className="h-[1.5em]" />;
  return (
    <div className="whitespace-pre-wrap break-words">
      {spans.map((sp, i) => (
        <SpanView key={i} span={sp} onRun={onRun} />
      ))}
    </div>
  );
}

function Picture({ image, onLoad, className = "" }: { image: ImageRef; onLoad?: () => void; className?: string }) {
  return (
    <figure className={`my-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        onLoad={onLoad}
        className="h-[300px] w-auto max-w-full rounded-md border border-white/10 object-cover"
      />
      {image.caption && <figcaption className="mt-1 text-t-muted">{`# ${image.caption}`}</figcaption>}
    </figure>
  );
}

// ------------------------------------------------------------------ markdown

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function inline(text: string, onRun: RunFn): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return (
        <code key={i} className="rounded bg-white/10 px-1 text-t-yellow">
          {part.slice(1, -1)}
        </code>
      );
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, target] = link;
      if (target.startsWith("cmd:"))
        return <SpanView key={i} span={{ text: label, tone: "green", cmd: target.slice(4) }} onRun={onRun} />;
      return <SpanView key={i} span={{ text: label, tone: "cyan", href: target }} onRun={onRun} />;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return (
        <em key={i} className="text-t-muted">
          {part.slice(1, -1)}
        </em>
      );
    return part;
  });
}

/** Markdown, styled like a terminal pager (glow/bat): visible # marks, • bullets. */
function Markdown({ source, onRun, onMedia }: { source: string; onRun: RunFn; onMedia?: () => void }) {
  const out: ReactNode[] = [];
  const paras = source.split(/\n{2,}/);
  paras.forEach((para, pi) => {
    const lines = para.split("\n");
    if (lines.every((l) => /^\s*[-*] /.test(l))) {
      out.push(
        <ul key={pi} className="my-1">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-t-magenta">•</span>
              <span className="min-w-0">{inline(l.replace(/^\s*[-*] /, ""), onRun)}</span>
            </li>
          ))}
        </ul>,
      );
      return;
    }
    if (lines.every((l) => l.startsWith(">"))) {
      out.push(
        <blockquote key={pi} className="my-1 border-l-2 border-t-muted/60 pl-3 text-t-muted italic">
          {inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), onRun)}
        </blockquote>,
      );
      return;
    }
    const img = para.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      out.push(
        <figure key={pi} className="my-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img[2]}
            alt={img[1]}
            loading="lazy"
            onLoad={onMedia}
            className="aspect-[1440/760] w-full max-w-[640px] rounded-md border border-white/10 object-cover object-top"
          />
        </figure>,
      );
      return;
    }
    if (para.trim() === "---") {
      out.push(<div key={pi} className="my-2 text-t-muted">{"─".repeat(40)}</div>);
      return;
    }
    out.push(
      <div key={pi} className="my-1">
        {lines.map((l, i) => {
          const h = l.match(/^(#{1,3}) (.*)$/);
          if (h)
            return (
              <div key={i} className={`${h[1].length === 1 ? "text-t-yellow" : "text-t-blue"} font-bold ${i ? "" : ""}`}>
                <span className="opacity-50">{h[1]} </span>
                {inline(h[2], onRun)}
              </div>
            );
          return (
            <div key={i} className="whitespace-pre-wrap break-words">
              {inline(l, onRun)}
            </div>
          );
        })}
      </div>,
    );
  });
  return <div className="max-w-[78ch]">{out}</div>;
}

// ------------------------------------------------------------------ blocks

type Group = Block | { kind: "gallery"; images: ImageRef[] };

/** Consecutive images render side by side. */
function group(blocks: Block[]): Group[] {
  const out: Group[] = [];
  for (const b of blocks) {
    const last = out[out.length - 1];
    if (b.kind === "image" && last?.kind === "gallery") last.images.push(b.image);
    else if (b.kind === "image") out.push({ kind: "gallery", images: [b.image] });
    else out.push(b);
  }
  return out;
}

export function Output({ blocks, onRun, onMedia }: { blocks: Block[]; onRun: RunFn; onMedia?: () => void }) {
  return (
    <>
      {group(blocks).map((b, i) => {
        switch (b.kind) {
          case "gallery":
            return (
              <div key={i} className="flex flex-wrap items-start gap-4">
                {b.images.map((img) => (
                  <Picture key={img.src} image={img} onLoad={onMedia} />
                ))}
              </div>
            );
          case "line":
            return <Line key={i} spans={b.spans} onRun={onRun} />;
          case "markdown":
            return <Markdown key={i} source={b.source} onRun={onRun} onMedia={onMedia} />;
          case "card":
            return (
              <div key={i} className="my-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image.src}
                  alt={b.image.alt}
                  onLoad={onMedia}
                  className="h-40 w-36 shrink-0 rounded-md border border-white/10 object-cover object-top sm:h-52 sm:w-44"
                />
                <div className="min-w-0">
                  {b.lines.map((spans, j) => (
                    <Line key={j} spans={spans} onRun={onRun} />
                  ))}
                </div>
              </div>
            );
        }
      })}
    </>
  );
}
