import { ArrowUp } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8">
      <div className="container-narrow flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Logo className="h-5 w-5 text-subtle" />
          <p className="text-sm text-subtle">
            © {year} {siteConfig.name}
          </p>
        </div>
        <a
          href="#top"
          className="inline-flex items-center gap-1 text-sm text-subtle transition-colors hover:text-foreground"
        >
          Back to top
          <ArrowUp className="h-3.5 w-3.5" />
        </a>
      </div>
    </footer>
  );
}
