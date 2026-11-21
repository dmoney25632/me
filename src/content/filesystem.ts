// The terminal's filesystem. Files are built from the lists in site.ts and
// writing.ts, so most edits happen there. Add a one-off file by adding a
// node to `home` below.
//
// File kinds: markdown (rendered), text (printed as-is), image (shown inline),
// link (opens a URL), exec (runs a command when "executed", like ./net).

import type { DirNode, FileContent, FileNode, FsNode } from "@/lib/terminal/types";
import {
  about,
  education,
  experience,
  future42,
  now,
  photos,
  projects,
  siteConfig,
} from "./site";
import { essays, formatDate, readingTime } from "./writing";

const file = (name: string, content: FileContent): FileNode => ({ type: "file", name, content });
const dir = (name: string, children: FsNode[]): DirNode => ({ type: "dir", name, children });
const md = (name: string, text: string) => file(name, { kind: "markdown", text: text.trim() });
const txt = (name: string, text: string) => file(name, { kind: "text", text: text.replace(/^\n/, "").trimEnd() });
const link = (name: string, url: string, label: string) => file(name, { kind: "link", url, label });

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ------------------------------------------------------------------ ~/

const readme = md(
  "README.md",
  `
# Hey, I'm ${siteConfig.name}.

${siteConfig.tagline}

This is my website, and it's a terminal. Everything about me is a file in here.

## Start here

- [cat about.md](cmd:cat about.md) — the short version
- [cat now.md](cmd:cat now.md) — what I'm doing right now
- [cd future42](cmd:cd future42) — the company I'm building
- [ls projects](cmd:ls projects) — things I've built
- [cat experience.md](cmd:cat experience.md) — where I've worked
- [open photos](cmd:open photos) — what I look like
- [cat contact.txt](cmd:cat contact.txt) — how to reach me

Prefer a normal website? [gui](cmd:gui) opens one.

Type \`help\` for every command. \`Tab\` completes, \`↑\` / \`↓\` scroll history.
`,
);

const aboutMd = md(
  "about.md",
  `
# about

${siteConfig.intro}

${about.bullets.map((b) => `- ${b}`).join("\n")}

## what I care about

${about.values.map((v) => `- ${v}`).join("\n")}

Run [neofetch](cmd:neofetch) for the one-screen version.
`,
);

const nowMd = md(
  "now.md",
  `
# now

*Updated ${formatDate(now.updated)} · ${siteConfig.location}*

${now.items.map((i) => `- ${i}`).join("\n")}
`,
);

const experienceMd = md(
  "experience.md",
  `
# experience

${experience
  .map(
    (e) => `## ${e.company}
**${e.role}** · ${e.period} · ${e.location}

${e.description}`,
  )
  .join("\n\n")}
`,
);

const educationTxt = txt(
  "education.txt",
  education.map((e) => `${e.school.padEnd(28)} ${e.detail.padEnd(28)} ${e.period}`).join("\n"),
);

const contactTxt = txt(
  "contact.txt",
  `
x         ${siteConfig.socials.twitter}
github    ${siteConfig.socials.github}
linkedin  ${siteConfig.socials.linkedin}
location  ${siteConfig.location}

The fastest way to reach me is a DM on X. Run \`dm\` to open it.
`,
);

// ------------------------------------------------------------------ ~/future42

const p = future42.product;
const future42Dir = dir("future42", [
  md(
    "README.md",
    `
# ${future42.name}

${future42.blurb}

- [cat val.md](cmd:cat future42/val.md) — the product
- [open ftr42.com](${future42.url})
`,
  ),
  md(
    "val.md",
    `
# ${p.name} — ${p.tagline}

${p.description}

${p.pillars.map((x) => `## ${x.title}\n${x.body}`).join("\n\n")}

## how it's built

${p.built.map((b) => `- ${b}`).join("\n")}

**stack:** ${p.stack.map((t) => `\`${t}\``).join(" ")}

## what's in the box

${p.surfaces.map((s) => `- ${s}`).join("\n")}

[open valspark.ai](${p.url})
`,
  ),
  link("ftr42.com.url", future42.url, "Future 42"),
  link("valspark.ai.url", p.url, "VAL"),
]);

// ------------------------------------------------------------------ ~/projects

const projectsDir = dir(
  "projects",
  projects.map((pr) => {
    const links = [
      pr.liveUrl && `- live: [${pr.liveUrl.replace(/^https?:\/\//, "")}](${pr.liveUrl})`,
      pr.githubUrl
        ? `- code: [${pr.githubUrl.replace(/^https?:\/\//, "")}](${pr.githubUrl})`
        : `- code: private repo · [more on my GitHub](${siteConfig.socials.github})`,
    ].filter(Boolean);
    return md(
      `${pr.id}.md`,
      `
# ${pr.title}${pr.featured ? " ★" : ""}

*${pr.kind} · ${pr.period}*

${pr.description}
${pr.built?.length ? `\n## what I built\n\n${pr.built.map((b) => `- ${b}`).join("\n")}\n` : ""}
**stack:** ${pr.tech.map((t) => `\`${t}\``).join(" ")}
${links.length ? `\n${links.join("\n")}` : ""}
`,
    );
  }),
);

// ------------------------------------------------------------------ ~/writing

const writingDir = dir(
  "writing",
  essays.length
    ? essays.map((e) =>
        e.body
          ? md(
              `${e.slug}.md`,
              `# ${e.title}\n\n*${formatDate(e.date)} · ${readingTime(e.body)}*\n\n${e.body}`,
            )
          : link(`${slugify(e.title)}.url`, e.externalUrl!, `${e.title}${e.publication ? ` (${e.publication})` : ""}`),
      )
    : [md("README.md", "# writing\n\nNothing published yet. Check back soon.")],
);

// ------------------------------------------------------------------ ~/photos, ~/links

const photosDir = dir(
  "photos",
  photos.map((ph) => file(ph.file, { kind: "image", image: { src: ph.src, alt: ph.alt, caption: ph.caption } })),
);

const linksDir = dir("links", [
  link("github.url", siteConfig.socials.github, "GitHub"),
  link("linkedin.url", siteConfig.socials.linkedin, "LinkedIn"),
  link("x.url", siteConfig.socials.twitter, "X"),
  link("future42.url", future42.url, "Future 42"),
  link("val.url", future42.product.url, "VAL"),
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
  future42Dir,
  projectsDir,
  writingDir,
  photosDir,
  linksDir,
  file("net", {
    kind: "exec",
    command: "net",
    description: "show what your browser just told my server about you",
  }),
  secrets,
  zshrc,
]);

export const root: DirNode = dir("", [
  dir("bin", [
    ...["help", "ls", "cd", "cat", "open", "tree", "neofetch", "whoami", "grep", "net", "clear"].map((c) =>
      file(c, { kind: "exec", command: c, description: `the ${c} command` }),
    ),
  ]),
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
