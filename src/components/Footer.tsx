import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Wordmark } from "./Wordmark";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8">
      <div className="container-narrow flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <Link href="/" aria-label="Home">
            <Wordmark className="text-xl text-muted" />
          </Link>
          <p className="text-sm text-subtle">© {year}</p>
          <Link href="/net" className="hidden font-mono text-xs text-subtle transition-colors hover:text-accent sm:inline">
            ~/net
          </Link>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-sm text-subtle transition-colors hover:text-foreground"
        >
          Back to top
          <ArrowUp className="h-3.5 w-3.5" />
        </a>
      </div>
    </footer>
  );
}
