import { siteConfig } from "@/data/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.05] py-8">
      <div className="container-narrow flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p className="text-sm text-zinc-600">
          © {year} {siteConfig.name}
        </p>
        <p className="text-sm text-zinc-700">Next.js · Vercel</p>
      </div>
    </footer>
  );
}
