import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** A screenshot dressed as a browser window. The whole thing links to `url`. */
export function BrowserFrame({
  url,
  src,
  alt,
  dark = false,
  priority = false,
}: {
  url: string;
  src: string;
  alt: string;
  dark?: boolean;
  priority?: boolean;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`group block overflow-hidden rounded-xl shadow-[0_30px_60px_-30px_rgb(52_41_31/0.55)] ring-1 transition-transform duration-500 hover:-translate-y-1 ${
        dark ? "bg-[#2a241e] ring-white/10" : "bg-paper-2 ring-line"
      }`}
    >
      <div className="flex items-center gap-3 px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span
          className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-3 py-1 font-mono text-[11px] ${
            dark ? "bg-white/10 text-paper/70" : "bg-card text-ink/60 ring-1 ring-line"
          }`}
        >
          <span className="truncate">{bare(url)}</span>
          <ArrowUpRight className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </div>
      <div className="relative aspect-[1440/760] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
          sizes="(min-width: 1024px) 640px, 100vw"
        />
      </div>
    </a>
  );
}
