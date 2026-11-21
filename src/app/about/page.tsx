import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Lock, SquareTerminal } from "lucide-react";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/brand-icons";
import { Hero } from "@/components/profile/Hero";
import { Reveal } from "@/components/profile/motion";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { pill } from "@/components/profile/styles";
import { about, education, experience, future42, profile, projects, siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.tagline,
};

const { github, twitter, linkedin } = siteConfig.socials;
const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

/** Shared section frame so every section lines up on the same grid. */
function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
          <Reveal inView>
            <p className="eyebrow text-ink/55">{eyebrow}</p>
            <h2 className="display mt-3 text-[clamp(2.4rem,5vw,3.6rem)] text-ink">{title}</h2>
          </Reveal>
          <div />
        </div>
        <div className="mt-10 md:mt-14">{children}</div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const p = future42.product;
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
                src={profile.aboutPhoto.src}
                alt={profile.aboutPhoto.alt}
                fill
                className="object-cover object-top"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <p className="absolute bottom-3 left-3 w-fit rounded-full bg-ink-2/80 px-3.5 py-1.5 font-mono text-[12px] text-paper backdrop-blur-sm">
                {profile.aboutPhoto.caption}
              </p>
            </Reveal>

            <div>
              <Reveal inView>
                <p className="eyebrow text-ink/55">About</p>
              </Reveal>
              <Reveal inView delay={0.1}>
                <p className="display mt-4 text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.1] text-ink">
                  {siteConfig.intro}
                </p>
              </Reveal>
              <Reveal inView delay={0.2}>
                <ul className="mt-8 space-y-3 border-t border-line pt-6">
                  {about.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-[16px] leading-relaxed text-ink/80">
                      <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-brass" />
                      {b}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-6xl grid-cols-2 border-t border-line md:mt-28 md:grid-cols-4">
            {profile.stats.map((s, i) => (
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

        {/* ---------------------------------------------------------- building */}
        {/* Dark band: inset 12/20px from the edges, with content padded so it lines up with every other section. */}
        <section id="building" className="scroll-mt-24 py-10">
          <div className="mx-3 overflow-hidden rounded-[2rem] bg-ink-2 py-16 text-paper sm:mx-5 md:py-24">
            <div className="px-2 sm:px-3">
              <div className="mx-auto max-w-6xl">
                <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
                  <Reveal inView>
                    <p className="eyebrow text-paper/50">What I&apos;m building</p>
                    <h2 className="display mt-3 text-[clamp(2.8rem,5vw,3.8rem)]">
                      {p.name}, by <span className="whitespace-nowrap text-glow italic">{future42.name}</span>
                    </h2>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`${pill} h-11 bg-glow px-5 text-[14px] text-ink-2`}
                      >
                        valspark.ai <ArrowUpRight className="size-4" />
                      </a>
                      <a
                        href={future42.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`${pill} h-11 px-5 text-[14px] text-paper ring-1 ring-white/20 hover:bg-white/10`}
                      >
                        ftr42.com <ArrowUpRight className="size-4" />
                      </a>
                    </div>
                  </Reveal>
                  <Reveal inView delay={0.1}>
                    <p className="display text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.15] text-paper/90">
                      {p.description}
                    </p>
                    <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-paper/65">{future42.blurb}</p>
                  </Reveal>
                </div>

                <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3">
                  {p.pillars.map((x, i) => (
                    <Reveal inView delay={0.1 + i * 0.08} key={x.title} className="bg-ink-2 p-6">
                      <p className="font-mono text-[12px] text-glow">0{i + 1}</p>
                      <p className="mt-2 text-[16px] font-medium">{x.title}</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-paper/60">{x.body}</p>
                    </Reveal>
                  ))}
                </div>

                <div className="mt-14 grid gap-6 border-t border-white/10 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
                  <Reveal inView>
                    <p className="eyebrow text-paper/50">Technical breakdown</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {p.stack.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-white/10 px-3 py-1 font-mono text-[12px] whitespace-nowrap text-paper/85"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </Reveal>
                  <Reveal inView delay={0.1}>
                    <ul className="space-y-3">
                      {p.built.map((b) => (
                        <li key={b} className="flex gap-3 text-[15px] leading-relaxed text-paper/75">
                          <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-glow" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- projects */}
        <Section
          id="projects"
          eyebrow="Projects"
          title={
            <>
              Things I&apos;ve <span className="text-maroon italic">built</span>
            </>
          }
        >
          <ol className="border-t border-line">
            {projects.map((pr, i) => (
              <li key={pr.id} className="border-b border-line">
                <Reveal
                  inView
                  className="grid gap-6 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16 md:py-12"
                >
                  {/* left: title column */}
                  <div>
                    <p className="font-mono text-[12px] text-ink/50">
                      {String(i + 1).padStart(2, "0")} · {pr.kind}
                    </p>
                    <h3 className="display mt-2 text-[clamp(2rem,3.6vw,2.6rem)] text-ink">
                      {pr.title}
                      {pr.featured && <span className="ml-2 align-top text-[0.5em] text-brass">✦</span>}
                    </h3>
                    <p className="mt-1 font-mono text-[12px] text-ink/50">{pr.period}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {pr.githubUrl ? (
                        <a
                          href={pr.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`${pill} bg-ink-2 text-paper`}
                        >
                          <GitHubIcon className="size-3.5" /> Source
                        </a>
                      ) : (
                        <a
                          href={github}
                          target="_blank"
                          rel="noreferrer"
                          title="This repo is private. Here's my GitHub instead."
                          className={`${pill} text-ink ring-1 ring-line hover:bg-paper-2`}
                        >
                          <Lock className="size-3.5" /> Private repo · GitHub
                        </a>
                      )}
                      {pr.liveUrl && (
                        <a
                          href={pr.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`${pill} bg-mint text-mint-ink`}
                        >
                          Live <ArrowUpRight className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* right: breakdown */}
                  <div>
                    <p className="text-[17px] leading-relaxed text-ink/85">{pr.description}</p>
                    {pr.built && pr.built.length > 0 && (
                      <div className="mt-6 rounded-2xl bg-card p-5 ring-1 ring-line sm:p-6">
                        <p className="eyebrow text-ink/50">Technical breakdown</p>
                        <ul className="mt-4 space-y-3">
                          {pr.built.map((b) => (
                            <li key={b} className="flex gap-3 text-[15px] leading-relaxed text-ink/80">
                              <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-maroon/70" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {pr.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-paper-2 px-3 py-1 font-mono text-[12px] text-ink/75 ring-1 ring-line"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>

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
            {experience.map((e) => (
              <li key={e.company} className="border-b border-line">
                <Reveal inView className="grid gap-3 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
                  <div>
                    <h3 className="display text-[1.9rem] text-ink">{e.company}</h3>
                    <p className="mt-1 font-mono text-[12px] text-ink/50">
                      {e.period} · {e.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-ink">{e.role}</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{e.description}</p>
                  </div>
                </Reveal>
              </li>
            ))}
            {education.map((e) => (
              <li key={e.school} className="border-b border-line">
                <Reveal inView className="grid gap-3 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
                  <div>
                    <h3 className="display text-[1.9rem] text-ink">{e.school}</h3>
                    <p className="mt-1 font-mono text-[12px] text-ink/50">{e.period}</p>
                  </div>
                  <p className="text-[15px] font-medium text-ink md:pt-2">{e.detail}</p>
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
                { href: twitter, label: "X", sub: "@daytonrunyan", icon: XIcon, cls: "bg-black text-white" },
                { href: github, label: "GitHub", sub: handle(github), icon: GitHubIcon, cls: "bg-ink-2 text-paper" },
                {
                  href: linkedin,
                  label: "LinkedIn",
                  sub: handle(linkedin),
                  icon: LinkedInIcon,
                  cls: "bg-[#0a66c2] text-white",
                },
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
                © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.location}
              </span>
              <span className="flex items-center gap-4">
                <a href={github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
                  <GitHubIcon className="size-3.5" /> GitHub
                </a>
                <a href={twitter} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
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
