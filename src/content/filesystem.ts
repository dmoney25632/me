// The terminal's filesystem, built from the other files in src/content.
// You rarely need to touch this: add a project to projects.ts and it shows
// up as ~/projects/<id>.md automatically. Add one-off files to `home` below.
//
// File kinds: markdown (rendered), text (printed as-is), image (shown inline),
// link (opens a URL), exec (runs a terminal command, like ./play).
// Markdown links like [label](cmd:ls projects) become clickable commands, and
// ![alt](/shots/x.jpg) shows a picture.

import type { DirNode, FileContent, FileNode, FsNode, NeofetchCard } from "@/lib/terminal/types";
import { companies, val } from "./companies";
import { jobs, schools } from "./experience";
import { aboutBullets, me, now, photos, values } from "./me";
import { game, projects } from "./projects";
import type { Project } from "./types";
import { essays, formatDate, readingTime } from "./writing";

const file = (name: string, content: FileContent): FileNode => ({ type: "file", name, content });
const dir = (name: string, children: FsNode[]): DirNode => ({ type: "dir", name, children });
const md = (name: string, text: string) => file(name, { kind: "markdown", text: text.trim() });
const txt = (name: string, text: string) => file(name, { kind: "text", text: text.replace(/^\n/, "").trimEnd() });
const link = (name: string, url: string, label: string) => file(name, { kind: "link", url, label });
const exec = (name: string, command: string, description: string) =>
  file(name, { kind: "exec", command, description });

const bullets = (items: string[]) => items.map((i) => `- ${i}`).join("\n");
const chips = (items: string[]) => items.map((t) => `\`${t}\``).join(" ");
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ------------------------------------------------------------------ ~/

const readme = md(
  "README.md",
  `
# Hey, I'm ${me.name}.

${me.tagline}

This website is a terminal. Everything about me is a file in here. Click anything green to run it, or type it yourself.

## Start here

- [cat about.md](cmd:cat about.md) — the short version
- [companies](cmd:companies) — Future 42, Corva Insurance, Rags Cleaning
- [projects](cmd:projects) — things I've built, simply explained
- [play](cmd:play) — play ${game.name}, a game I made, in your browser
- [lab](cmd:lab) — thousands of birds flocking, simulated in Rust
- [open photos](cmd:open photos) — what I look like
- [contact](cmd:contact) — GitHub, X, LinkedIn

Prefer a normal website? [gui](cmd:gui) opens one.

\`help\` lists every command. \`Tab\` completes, \`↑\` / \`↓\` scroll history.
`,
);

const aboutMd = md(
  "about.md",
  `
# about

${me.intro}

${bullets(aboutBullets)}

## what I care about

${bullets(values)}

Run [neofetch](cmd:neofetch) for the one-screen version.
`,
);

const nowMd = md(
  "now.md",
  `
# now

*Updated ${formatDate(now.updated)} · ${me.location}*

${bullets(now.items)}
`,
);

const experienceMd = md(
  "experience.md",
  `
# experience

## companies I started

${companies.map((c) => `**${c.name}** · ${c.role} · ${c.period} — [${bare(c.url)}](${c.url})`).join("\n\n")}

${jobs
  .map(
    (j) => `## ${j.company}
**${j.role}** · ${j.period} · ${j.location}

${j.description}`,
  )
  .join("\n\n")}

## school

${schools.map((s) => `**${s.name}** · ${s.detail} · ${s.period}`).join("\n\n")}
`,
);

const educationTxt = txt(
  "education.txt",
  schools.map((s) => `${s.name.padEnd(28)} ${s.detail.padEnd(28)} ${s.period}`).join("\n"),
);

const contactTxt = txt(
  "contact.txt",
  `
x         ${me.links.x}
github    ${me.links.github}
linkedin  ${me.links.linkedin}
location  ${me.location}

The fastest way to reach me is a DM on X. Run \`dm\` to open it.
`,
);

// ------------------------------------------------------------------ ~/companies

const companiesDir = dir("companies", [
  md(
    "README.md",
    `
# companies

${companies.map((c) => `- [${c.name}](cmd:cat ~/companies/${c.id}.md) — ${c.oneLiner}`).join("\n")}
`,
  ),
  ...companies.map((c) =>
    md(
      `${c.id}.md`,
      `
# ${c.name}

*${c.role} · ${c.period}*

${c.oneLiner}

${c.shot ? `![${c.name} website](${c.shot})\n\n` : ""}${c.story}

## what I did

${bullets(c.highlights)}
${c.stack ? `\n**stack:** ${chips(c.stack)}\n` : ""}${c.id === "future42" ? `\n[cat val.md](cmd:cat ~/companies/val.md) for how VAL is built.\n` : ""}
**visit:** [${bare(c.url)}](${c.url})
`,
    ),
  ),
  md(
    "val.md",
    `
# ${val.name} — ${val.tagline}

*by ${val.company}*

${val.description}

${val.pillars.map((x) => `## ${x.title}\n${x.body}`).join("\n\n")}

## how it's built

${bullets(val.howItWorks)}

**stack:** ${chips(val.stack)}

**visit:** [${bare(val.url)}](${val.url})
`,
  ),
  ...companies.map((c) => link(`${c.id}.url`, c.url, c.name)),
]);

// ------------------------------------------------------------------ ~/projects

function projectLinks(p: Project) {
  const out: string[] = [];
  if (p.links.play) out.push(`- play: [${bare(p.links.play)}](${p.links.play})`);
  if (p.links.live) out.push(`- live: [${bare(p.links.live)}](${p.links.live})`);
  out.push(
    p.links.code
      ? `- code: [${bare(p.links.code)}](${p.links.code})`
      : `- code: private repo · [more on my GitHub](${me.links.github})`,
  );
  return out.join("\n");
}

const projectsDir = dir(
  "projects",
  projects.map((p) =>
    md(
      `${p.id}.md`,
      `
# ${p.name}${p.featured ? " ✦" : ""}

*${p.kind} · ${p.year}*

**In short:** ${p.oneLiner}

${p.shot ? `![${p.name}](${p.shot})\n\n` : ""}${p.howItWorks?.length ? `## how it works\n\n${bullets(p.howItWorks)}\n\n` : ""}${p.stack?.length ? `**stack:** ${chips(p.stack)}\n\n` : ""}${projectLinks(p)}
`,
    ),
  ),
);

// ------------------------------------------------------------------ ~/writing

const writingDir = dir(
  "writing",
  essays.length
    ? essays.map((e) =>
        e.body
          ? md(`${e.slug}.md`, `# ${e.title}\n\n*${formatDate(e.date)} · ${readingTime(e.body)}*\n\n${e.body}`)
          : link(
              `${slugify(e.title)}.url`,
              e.externalUrl!,
              `${e.title}${e.publication ? ` (${e.publication})` : ""}`,
            ),
      )
    : [md("README.md", "# writing\n\nNothing published yet. Check back soon.")],
);

// ------------------------------------------------------------------ ~/photos, ~/links

const photosDir = dir(
  "photos",
  photos.map((ph) => file(ph.file, { kind: "image", image: { src: ph.src, alt: ph.alt, caption: ph.caption } })),
);

const linksDir = dir("links", [
  link("github.url", me.links.github, "GitHub"),
  link("x.url", me.links.x, "X"),
  link("linkedin.url", me.links.linkedin, "LinkedIn"),
  ...companies.map((c) => link(`${c.id}.url`, c.url, c.name)),
  link("val.url", val.url, "VAL"),
  link("game.url", game.links.play!, game.name),
]);

// ------------------------------------------------------------------ dotfiles

const secrets = txt(
  ".secrets",
  `
you found the hidden file. respect.

1. The Spanish is real. Pruébame.
2. This whole site is TypeScript pretending to be zsh.
3. There is no step 3.

try: sudo hire dayton
`,
);

const zshrc = txt(
  ".zshrc",
  `
# ~/.zshrc
export LANG="en_US.UTF-8"     # también es_CO
alias ship="git push"
PROMPT='%n@runyan %~ %# '
`,
);

// ------------------------------------------------------------------ root

const home = dir("dayton", [
  readme,
  aboutMd,
  nowMd,
  experienceMd,
  educationTxt,
  contactTxt,
  companiesDir,
  projectsDir,
  writingDir,
  photosDir,
  linksDir,
  exec("play", "play", `play ${game.name} in your browser`),
  exec("lab", "lab", "watch thousands of birds flock, simulated in Rust"),
  exec("net", "net", "show what your browser just told my server about you"),
  secrets,
  zshrc,
]);

export const root: DirNode = dir("", [
  dir(
    "bin",
    ["help", "ls", "cd", "cat", "open", "tree", "neofetch", "whoami", "grep", "play", "lab", "net", "clear"].map((c) =>
      exec(c, c, `the ${c} command`),
    ),
  ),
  dir("etc", [
    txt(
      "motd",
      `
Welcome to runyan.sh — a terminal that's also a website.
Type 'help' to get started, or just poke around.
`,
    ),
    txt("hostname", "runyan"),
  ]),
  dir("home", [home]),
  dir("tmp", []),
]);

// ------------------------------------------------------------------ neofetch

/** The one-screen summary `neofetch` prints when the terminal opens. */
export const neofetchCard: NeofetchCard = {
  image: { src: photos[0].src, alt: photos[0].alt },
  rows: [
    { label: "Name", value: me.name },
    { label: "Role", value: me.title },
    { label: "Location", value: me.location },
    { label: "Companies", value: companies.map((c) => c.name.replace(" Insurance Group", "")).join(" · "), cmd: "companies" },
    { label: "Building", value: `${val.name} at ${val.company}`, cmd: "cat ~/companies/val.md" },
    { label: "Projects", value: `${projects.length} things I've built`, cmd: "projects" },
    { label: "Play", value: `${game.name}, in your browser`, cmd: "play" },
    { label: "Lab", value: "Flock, in Rust + WebAssembly", cmd: "lab" },
    { label: "School", value: `${schools[0].name}, ${schools[0].detail.replace("B.S., ", "")}` },
    { label: "Languages", value: "English, Español" },
    { label: "Contact", value: "x · github · linkedin", cmd: "contact" },
  ],
};
