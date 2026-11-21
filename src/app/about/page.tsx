// The "regular website" version of me. Every word on this page comes from
// src/content: edit those files, not this one, to change what it says.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gamepad2, SquareTerminal, Users } from "lucide-react";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/brand-icons";
import { BrowserFrame } from "@/components/about/BrowserFrame";
import { Hero } from "@/components/about/Hero";
import { Parallax, Reveal } from "@/components/ui/motion";
import { ProfileNav } from "@/components/about/ProfileNav";
import { ProjectGrid } from "@/components/about/ProjectGrid";
import { pill } from "@/components/ui/styles";
import { aboutBullets, companies, game, hero, jobs, lifePhotos, me, projects, schools, val } from "@/content";

export const metadata: Metadata = {
  title: "About",
  description: me.tagline,
};

const { github, x, linkedin } = me.links;
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const stats = [
  { value: String(companies.length), label: "Companies started" },
  { value: String(projects.length), label: "Side projects shipped" },
  { value: hero.est, label: "Starting things since" },
  { value: "2", label: "Languages: English, Español" },
];

/** Shared section frame so every section lines up on the same grid. */
function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-end md:gap-16">
          <Reveal inView>
            <p className="eyebrow text-ink/55">{eyebrow}</p>
            <h2 className="display mt-3 text-[clamp(2.4rem,5vw,3.6rem)] text-ink">{title}</h2>
          </Reveal>
          {intro ? (
            <Reveal inView delay={0.1}>
              <p className="max-w-xl text-[17px] leading-relaxed text-ink/70">{intro}</p>
            </Reveal>
          ) : (
            <div />
          )}
        </div>
        <div className="mt-10 md:mt-14">{children}</div>
      </div>
    </section>
  );
}

/** Dark rounded band, inset from the edges, content still on the shared grid. */
function DarkBand({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-10">
      <div className="mx-3 overflow-hidden rounded-[2rem] bg-ink-2 py-16 text-paper sm:mx-5 md:py-24">
        <div className="px-2 sm:px-3">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Bullets({ items, dot = "bg-maroon/70", className = "text-ink/80" }: { items: string[]; dot?: string; className?: string }) {
  return (
    <ul className="space-y-3">
      {items.map((b) => (
        <li key={b} className={`flex gap-3 text-[15px] leading-relaxed ${className}`}>
          <span className={`mt-[0.6em] size-1.5 shrink-0 rounded-full ${dot}`} />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  return (
    <div className="paper-theme grain min-h-dvh overflow-x-clip">
      <ProfileNav />
      <main>
        <Hero />

        {/* ---------------------------------------------------------- about */}
        <section id="about" className="scroll-mt-24 px-5 pt-20 pb-10 sm:px-8 md:pt-28">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-20">
            <Reveal inView className="relative aspect-[4/5] overflow-hidden rounded-md bg-sky">
              <Image
                src={hero.aboutPhoto.src}
                alt={hero.aboutPhoto.alt}
                fill
                className="object-cover object-top"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <p className="absolute bottom-3 left-3 w-fit rounded-full bg-ink-2/80 px-3.5 py-1.5 font-mono text-[12px] text-paper backdrop-blur-sm">
                {hero.aboutPhoto.caption}
              </p>
            </Reveal>

            <div>
              <Reveal inView>
                <p className="eyebrow text-ink/55">About</p>
              </Reveal>
              <Reveal inView delay={0.1}>
                <p className="display mt-4 text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.1] text-ink">{me.intro}</p>
              </Reveal>
              <Reveal inView delay={0.2} className="mt-8 border-t border-line pt-6">
                <Bullets items={aboutBullets} dot="bg-brass" className="text-[16px] text-ink/80" />
              </Reveal>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-6xl grid-cols-2 border-t border-line md:mt-28 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal
                inView
                delay={i * 0.08}
                key={s.label}
                className="border-b border-line py-8 pr-4 even:pl-6 md:border-r md:border-b-0 md:px-6 md:first:pl-0 md:last:border-r-0 md:even:pl-6"
              >
                <span className="display block text-[clamp(3rem,7vw,4.5rem)] text-ink">{s.value}</span>
                <p className="mt-2 text-[14px] text-ink/60">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------- off the clock */}
        <section id="life" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-end md:gap-16">
              <Reveal inView>
                <p className="eyebrow text-ink/55">Off the clock</p>
                <h2 className="display mt-3 text-[clamp(2.4rem,5vw,3.6rem)] text-ink">
                  A few <span className="text-maroon italic">snapshots</span>
                </h2>
              </Reveal>
              <Reveal inView delay={0.1}>
                <p className="max-w-xl text-[17px] leading-relaxed text-ink/70">
                  Startup events, the mountains, car shows, and a lot of late nights.
                </p>
              </Reveal>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 md:mt-14 md:grid-cols-4 md:gap-6">
              {lifePhotos.map((ph, i) => (
                <Reveal
                  inView
                  delay={i * 0.08}
                  key={ph.src}
                  className={`${i % 2 ? "md:mt-12" : ""} ${["md:-rotate-2", "md:rotate-1", "md:-rotate-1", "md:rotate-2"][i % 4]}`}
                >
                  <figure className="rounded-md bg-card p-2 pb-3 shadow-[0_20px_40px_-24px_rgb(52_41_31/0.55)] ring-1 ring-line transition-transform duration-500 hover:z-10 hover:scale-[1.03] hover:rotate-0">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-sky">
                      <Image src={ph.src} alt={ph.alt} fill className="object-cover" sizes="(min-width: 768px) 260px, 45vw" />
                    </div>
                    <figcaption className="mt-2.5 px-1 font-mono text-[11.5px] leading-snug text-ink/60">{ph.caption}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- companies */}
        <Section
          id="companies"
          eyebrow="Companies"
          title={
            <>
              Things I <span className="text-maroon italic">started</span>
            </>
          }
          intro="Real businesses with real customers. Click any screenshot to visit the site."
        >
          <div className="space-y-20 md:space-y-28">
            {companies.map((c, i) => (
              <Reveal
                inView
                key={c.id}
                className="grid items-center gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-16"
              >
                <div className={i % 2 ? "md:order-2" : ""}>
                  {c.shot && (
                    <Parallax amount={28}>
                      <BrowserFrame url={c.url} src={c.shot} alt={`${c.name} website`} />
                    </Parallax>
                  )}
                </div>
                <div>
                  <p className="font-mono text-[12px] text-ink/50">
                    {String(i + 1).padStart(2, "0")} · {c.role} · {c.period}
                  </p>
                  <h3 className="display mt-2 text-[clamp(2.2rem,4vw,3rem)] text-ink">{c.name}</h3>
                  <p className="mt-3 text-[18px] leading-snug font-medium text-ink/90">{c.oneLiner}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{c.story}</p>
                  <div className="mt-6">
                    <Bullets items={c.highlights} />
                  </div>
                  {c.stack && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {c.stack.map((t) => (
                        <span key={t} className="rounded-full bg-paper-2 px-2.5 py-0.5 font-mono text-[11.5px] text-ink/70 ring-1 ring-line">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <a href={c.url} target="_blank" rel="noreferrer" className={`${pill} mt-7 h-11 bg-ink-2 px-5 text-[14px] text-paper`}>
                    Visit {bare(c.url)} <ArrowUpRight className="size-4" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------- VAL */}
        <DarkBand id="building">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
            <Reveal inView>
              <p className="eyebrow text-paper/50">What I&apos;m building now</p>
              <h2 className="display mt-3 text-[clamp(2.8rem,5vw,3.8rem)]">
                {val.name}, by <span className="whitespace-nowrap text-glow italic">{val.company}</span>
              </h2>
              <p className="mt-3 text-[16px] text-paper/65">{val.tagline}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={val.url} target="_blank" rel="noreferrer" className={`${pill} h-11 bg-glow px-5 text-[14px] text-ink-2`}>
                  {bare(val.url)} <ArrowUpRight className="size-4" />
                </a>
                <a
                  href={companies[0].url}
                  target="_blank"
                  rel="noreferrer"
                  className={`${pill} h-11 px-5 text-[14px] text-paper ring-1 ring-white/20 hover:bg-white/10`}
                >
                  {bare(companies[0].url)} <ArrowUpRight className="size-4" />
                </a>
              </div>
            </Reveal>
            <Reveal inView delay={0.1}>
              <p className="display text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.15] text-paper/90">{val.description}</p>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3">
            {val.pillars.map((p, i) => (
              <Reveal inView delay={0.1 + i * 0.08} key={p.title} className="bg-ink-2 p-6">
                <p className="font-mono text-[12px] text-glow">0{i + 1}</p>
                <p className="mt-2 text-[16px] font-medium">{p.title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-paper/60">{p.body}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid gap-6 border-t border-white/10 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
            <Reveal inView>
              <p className="eyebrow text-paper/50">How it&apos;s built</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {val.stack.map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-3 py-1 font-mono text-[12px] whitespace-nowrap text-paper/85">
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal inView delay={0.1}>
              <Bullets items={val.howItWorks} dot="bg-glow" className="text-paper/75" />
            </Reveal>
          </div>
        </DarkBand>

        {/* ---------------------------------------------------------- projects */}
        <Section
          id="projects"
          eyebrow="Projects"
          title={
            <>
              Things I&apos;ve <span className="text-maroon italic">built</span>
            </>
          }
          intro="Side projects, explained simply. Open “How it’s built” on any card for the technical breakdown."
        >
          <ProjectGrid />
        </Section>

        {/* ---------------------------------------------------------- play */}
        <DarkBand id="play">
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-16">
            <Reveal inView>
              <p className="eyebrow text-paper/50">Play something I made</p>
              <h2 className="display mt-3 text-[clamp(2.8rem,6vw,4.4rem)] leading-[0.95]">
                {game.name.split(" ")[0]} <span className="text-glow italic">{game.name.split(" ").slice(1).join(" ")}</span>
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-paper/80">{game.oneLiner}</p>
              <p className="mt-3 flex items-center gap-2 text-[14px] text-paper/55">
                <Users className="size-4" /> Make a free account, then play solo or bring friends with a party code.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={game.links.play} target="_blank" rel="noreferrer" className={`${pill} h-12 bg-glow px-6 text-[15px] text-ink-2`}>
                  <Gamepad2 className="size-4" /> Play now <ArrowUpRight className="size-4" />
                </a>
                {game.links.code && (
                  <a
                    href={game.links.code}
                    target="_blank"
                    rel="noreferrer"
                    className={`${pill} h-12 px-5 text-[15px] text-paper ring-1 ring-white/20 hover:bg-white/10`}
                  >
                    <GitHubIcon className="size-4" /> Source
                  </a>
                )}
              </div>
            </Reveal>
            <Reveal inView delay={0.1}>
              {game.shot && <BrowserFrame url={game.links.play!} src={game.shot} alt={`${game.name} in the browser`} dark />}
            </Reveal>
          </div>
        </DarkBand>

        {/* ---------------------------------------------------------- experience */}
        <Section
          id="experience"
          eyebrow="Experience"
          title={
            <>
              Where I&apos;ve <span className="text-maroon italic">worked</span>
            </>
          }
        >
          <ol className="border-t border-line">
            {jobs.map((j) => (
              <li key={j.company} className="border-b border-line">
                <Reveal inView className="grid gap-3 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
                  <div>
                    <h3 className="display text-[1.9rem] text-ink">{j.company}</h3>
                    <p className="mt-1 font-mono text-[12px] text-ink/50">
                      {j.period} · {j.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-ink">{j.role}</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{j.description}</p>
                  </div>
                </Reveal>
              </li>
            ))}
            {schools.map((s) => (
              <li key={s.name} className="border-b border-line">
                <Reveal inView className="grid gap-3 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
                  <div>
                    <h3 className="display text-[1.9rem] text-ink">{s.name}</h3>
                    <p className="mt-1 font-mono text-[12px] text-ink/50">{s.period}</p>
                  </div>
                  <p className="text-[15px] font-medium text-ink md:pt-2">{s.detail}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>

        {/* ---------------------------------------------------------- contact */}
        <section id="contact" className="scroll-mt-24 px-5 pt-10 pb-36 sm:px-8 lg:pb-24">
          <div className="mx-auto max-w-6xl border-t border-line pt-20 md:pt-28">
            <Reveal inView>
              <p className="eyebrow text-ink/55">Contact</p>
              <h2 className="display mt-3 max-w-3xl text-[clamp(3rem,8vw,6rem)] text-ink">
                Let&apos;s build <span className="text-maroon italic">something.</span>
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/75">
                The fastest way to reach me is a DM on X. Everything I can open-source lives on GitHub.
              </p>
            </Reveal>

            <Reveal inView delay={0.1} className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { href: x, label: "X", sub: `@${bare(x).split("/")[1]}`, icon: XIcon, cls: "bg-black text-white" },
                { href: github, label: "GitHub", sub: bare(github), icon: GitHubIcon, cls: "bg-ink-2 text-paper" },
                { href: linkedin, label: "LinkedIn", sub: bare(linkedin), icon: LinkedInIcon, cls: "bg-[#0a66c2] text-white" },
              ].map(({ href, label, sub, icon: Icon, cls }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={`group flex items-center gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-0.5 ${cls}`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-medium">{label}</span>
                    <span className="block truncate font-mono text-[12px] opacity-70">{sub}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </Reveal>

            <footer className="mt-20 flex flex-col gap-4 border-t border-line pt-6 font-mono text-[12px] text-ink/55 sm:flex-row sm:items-center sm:justify-between">
              <span>
                © {new Date().getFullYear()} {me.name} · {me.location}
              </span>
              <span className="flex flex-wrap items-center gap-4">
                {companies.map((c) => (
                  <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="hover:text-ink">
                    {c.name.replace(" Insurance Group", "")}
                  </a>
                ))}
                <a href={github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
                  <GitHubIcon className="size-3.5" /> GitHub
                </a>
                <a href={x} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
                  <XIcon className="size-3" /> X
                </a>
                <Link href="/" className="flex items-center gap-1.5 hover:text-ink">
                  <SquareTerminal className="size-3.5" /> Terminal
                </Link>
              </span>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
