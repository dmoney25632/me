import { siteConfig } from "@/data/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-border py-8">
      <div className="container-narrow flex items-center justify-between gap-3">
        <p className="text-sm text-subtle">
          © {year} {siteConfig.name}
        </p>
        <Logo className="h-5 w-5 text-subtle" />
      </div>
    </footer>
  );
}
