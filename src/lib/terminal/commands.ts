import { HOME, canonical, displayPath, getNode, resolvePath, sizeOf, sortedChildren, walk } from "./fs";
import type { Block, CommandResult, DirNode, FileNode, FsNode, NeofetchCard, ShellState, Span, Tone } from "./types";

// ------------------------------------------------------------------ helpers

const s = (text: string, tone?: Tone, extra?: Partial<Span>): Span => ({ text, tone, ...extra });
const line = (...spans: (Span | string)[]): Block => ({
  kind: "line",
  spans: spans.map((x) => (typeof x === "string" ? { text: x } : x)),
});
const err = (text: string): CommandResult => ({ blocks: [line(s(text, "red"))] });
const out = (...blocks: Block[]): CommandResult => ({ blocks });

/** Quote a path for a clickable command if it has spaces. */
const q = (p: string) => (/\s/.test(p) ? `"${p}"` : p);

/** Split a command line into words, honoring "double" and 'single' quotes. */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let quote: string | null = null;
  let has = false;
  for (const ch of input) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (/\s/.test(ch)) {
      if (has || cur) tokens.push(cur);
      cur = "";
      has = false;
    } else {
      cur += ch;
      has = true;
    }
  }
  if (has || cur) tokens.push(cur);
  return tokens;
}

function splitFlags(args: string[]) {
  const flags = new Set<string>();
  const rest: string[] = [];
  for (const a of args) {
    if (a.startsWith("-") && a.length > 1 && a !== "-") for (const f of a.slice(1)) flags.add(f);
    else rest.push(a);
  }
  return { flags, rest };
}

/** The path someone would type to reach `abs` from `cwd` (relative when it's below cwd). */
function relTo(cwd: string[], abs: string[]) {
  const below = cwd.every((p, i) => abs[i] === p);
  if (below && abs.length > cwd.length) return abs.slice(cwd.length).join("/");
  return displayPath(abs);
}

function toneFor(node: FsNode): Tone {
  if (node.type === "dir") return "blue";
  switch (node.content.kind) {
    case "image":
      return "magenta";
    case "link":
      return "cyan";
    case "exec":
      return "green";
    default:
      return node.name.startsWith(".") ? "muted" : "fg";
  }
}

/** The command that best "opens" a node when clicked. */
function actionFor(node: FsNode, path: string): string {
  if (node.type === "dir") return `cd ${q(path)} && ls`;
  if (node.content.kind === "exec") return node.content.command;
  if (node.content.kind === "link" || node.content.kind === "image") return `open ${q(path)}`;
  return `cat ${q(path)}`;
}

function nameSpan(node: FsNode, path: string, label = node.name): Span {
  const suffix = node.type === "dir" ? "/" : node.content.kind === "exec" ? "*" : "";
  return s(label + suffix, toneFor(node), { cmd: actionFor(node, path) });
}

function lookup(root: DirNode, cwd: string[], arg: string) {
  const path = resolvePath(cwd, arg);
  const node = getNode(root, path);
  return { path: node ? canonical(root, path) : path, node };
}

const fmtSize = (n: number) => (n >= 1024 ? `${(n / 1024).toFixed(n >= 10240 ? 0 : 1)}K` : `${n}`);

// ------------------------------------------------------------------ registry

export interface Context {
  root: DirNode;
  state: ShellState;
  now: Date;
  /** What `neofetch` prints. */
  card: NeofetchCard;
}

interface Command {
  usage: string;
  summary: string;
  group: "explore" | "about" | "system" | "fun";
  hidden?: boolean;
  run: (args: string[], ctx: Context) => CommandResult;
}

/** Lists a folder of markdown files as "Title   one-liner", featured (✦) first. */
function listMarkdown(ctx: Context, folder: string[], cmdPrefix: string): Block[] {
  const dir = getNode(ctx.root, [...HOME, ...folder]);
  if (!dir || dir.type !== "dir") return [];
  const files = dir.children.filter(
    (c): c is FileNode => c.type === "file" && c.content.kind === "markdown" && c.name !== "README.md",
  );
  const info = files.map((f) => {
    const text = f.content.kind === "markdown" ? f.content.text : "";
    return {
      f,
      title: text.match(/^# (.+)$/m)?.[1] ?? f.name,
      meta: text.match(/^\*(.+)\*$/m)?.[1] ?? "",
      short: text.match(/^\*\*In short:\*\* (.+)$/m)?.[1] ?? text.split("\n").find((l) => /^[A-Z]/.test(l)) ?? "",
    };
  });
  info.sort((a, b) => Number(b.title.includes("✦")) - Number(a.title.includes("✦")));
  const blocks: Block[] = [];
  for (const { f, title, meta, short } of info) {
    blocks.push(line(s(title, "blue", { cmd: `${cmdPrefix}${f.name}` }), s(`  ${meta}`, "muted")));
    if (short) blocks.push(line(s("  " + short, "fg")));
    blocks.push(line(""));
  }
  return blocks;
}

export const commands: Record<string, Command> = {
  help: {
    usage: "help",
    summary: "list every command",
    group: "system",
    run: () => {
      const groups: [Command["group"], string][] = [
        ["about", "about me"],
        ["explore", "get around"],
        ["system", "the usual"],
      ];
      const blocks: Block[] = [];
      for (const [g, title] of groups) {
        blocks.push(line(s(title, "yellow")));
        for (const [name, c] of Object.entries(commands)) {
          if (c.group !== g || c.hidden) continue;
          blocks.push(line("  ", s(c.usage.padEnd(22), "green", { cmd: name }), s(c.summary, "muted")));
        }
        blocks.push(line(""));
      }
      blocks.push(
        line(
          s("tip: ", "muted"),
          "click anything green or blue. ",
          s("Tab", "bold"),
          " completes, ",
          s("↑ ↓", "bold"),
          " walk history, ",
          s("ctrl+L", "bold"),
          " clears.",
        ),
      );
      return { blocks };
    },
  },

  // -------------------------------------------------------------- about
  about: {
    usage: "about",
    summary: "who I am (cat about.md)",
    group: "about",
    run: (_a, ctx) => commands.cat.run(["~/about.md"], ctx),
  },
  now: {
    usage: "now",
    summary: "what I'm doing right now",
    group: "about",
    run: (_a, ctx) => commands.cat.run(["~/now.md"], ctx),
  },
  companies: {
    usage: "companies",
    summary: "companies I've started",
    group: "about",
    run: (_a, ctx) => ({
      blocks: [
        ...listMarkdown(ctx, ["companies"], "cat ~/companies/"),
        line(s("click a name to read more, or ", "muted"), s("cat ~/companies/val.md", "green", { cmd: "cat ~/companies/val.md" }), s(" for how VAL works", "muted")),
      ],
    }),
  },
  projects: {
    usage: "projects",
    summary: "things I've built, simply explained",
    group: "about",
    run: (_a, ctx) => ({
      blocks: [
        ...listMarkdown(ctx, ["projects"], "cat ~/projects/"),
        line(s("click a name for the technical breakdown and links", "muted")),
      ],
    }),
  },
  play: {
    usage: "play",
    summary: "play a game I made",
    group: "about",
    run: (_a, ctx) => {
      const r = commands.open.run(["~/links/game.url"], ctx);
      return { ...r, blocks: [line(s("loading Iron Horizon… ", "green"), s("(make a free account, then play solo or co-op)", "muted")), ...r.blocks] };
    },
  },
  experience: {
    usage: "experience",
    summary: "where I've worked",
    group: "about",
    run: (_a, ctx) => commands.cat.run(["~/experience.md"], ctx),
  },
  resume: {
    usage: "resume",
    summary: "experience + education",
    group: "about",
    hidden: true,
    run: (_a, ctx) => {
      const a = commands.cat.run(["~/experience.md"], ctx);
      const b = commands.cat.run(["~/education.txt"], ctx);
      return { blocks: [...a.blocks, line(""), line(s("education", "yellow")), ...b.blocks] };
    },
  },
  contact: {
    usage: "contact",
    summary: "how to reach me",
    group: "about",
    run: (_a, ctx) => commands.cat.run(["~/contact.txt"], ctx),
  },
  gui: {
    usage: "gui",
    summary: "the regular website version",
    group: "about",
    run: () => ({ blocks: [line(s("opening /about…", "muted"))], navigate: "/about" }),
  },
  lab: {
    usage: "lab",
    summary: "a flocking sim I wrote in Rust",
    group: "about",
    run: () => ({
      blocks: [line(s("compiling Rust → WebAssembly… ", "green"), s("opening /lab", "muted"))],
      navigate: "/lab",
    }),
  },
  dm: {
    usage: "dm",
    summary: "message me on X",
    group: "about",
    run: (_a, ctx) => commands.open.run(["~/links/x.url"], ctx),
  },
  socials: {
    usage: "socials",
    summary: "github, linkedin, x",
    group: "about",
    run: (_a, ctx) => commands.ls.run(["~/links"], ctx),
  },
  neofetch: {
    usage: "neofetch",
    summary: "me, in one screen",
    group: "about",
    run: (_a, ctx) => ({
      blocks: [
        {
          kind: "card",
          image: ctx.card.image,
          lines: [
            [s("dayton", "green"), s("@", "muted"), s("runyan", "green")],
            [s("-------------", "muted")],
            ...ctx.card.rows.map((r): Span[] => [s(r.label.padEnd(10), "green"), s(r.value, "fg", r.cmd ? { cmd: r.cmd } : {})]),
            [],
            (["red", "yellow", "green", "cyan", "blue", "magenta"] as Tone[]).map((t) => s("███", t)),
          ],
        },
      ],
    }),
  },

  // -------------------------------------------------------------- explore
  ls: {
    usage: "ls [-a] [-l] [dir]",
    summary: "list files",
    group: "explore",
    run: (args, ctx) => {
      const { flags, rest } = splitFlags(args);
      const all = flags.has("a");
      const long = flags.has("l");
      const targets = rest.length ? rest : ["."];
      const blocks: Block[] = [];
      for (const [i, t] of targets.entries()) {
        const { path, node } = lookup(ctx.root, ctx.state.cwd, t);
        if (!node) {
          blocks.push(line(s(`ls: ${t}: No such file or directory`, "red")));
          continue;
        }
        if (targets.length > 1) blocks.push(line(s(`${t}:`, "bold")));
        const items: [FsNode, string[]][] =
          node.type === "dir" ? sortedChildren(node, all).map((c) => [c, [...path, c.name]]) : [[node, path]];
        if (long) {
          for (const [c, p] of items) {
            const perms = c.type === "dir" ? "drwxr-xr-x" : c.content.kind === "exec" ? "-rwxr-xr-x" : "-rw-r--r--";
            blocks.push(
              line(
                s(`${perms}  dayton  staff  ${fmtSize(sizeOf(c)).padStart(5)}  Nov 20  `, "muted"),
                nameSpan(c, relTo(ctx.state.cwd, p)),
                ...(c.type === "file" && c.content.kind === "link" ? [s(` -> ${c.content.url}`, "muted")] : []),
              ),
            );
          }
        } else if (items.length) {
          const spans: Span[] = [];
          items.forEach(([c, p], j) => {
            if (j) spans.push(s("   "));
            spans.push(nameSpan(c, relTo(ctx.state.cwd, p)));
          });
          blocks.push({ kind: "line", spans });
        }
        if (targets.length > 1 && i < targets.length - 1) blocks.push(line(""));
      }
      return { blocks };
    },
  },
  cd: {
    usage: "cd <dir>",
    summary: "change directory",
    group: "explore",
    run: (args, ctx) => {
      const target = args[0] ?? "~";
      const { path, node } = lookup(ctx.root, ctx.state.cwd, target);
      if (!node) return err(`cd: no such file or directory: ${target}`);
      if (node.type !== "dir") return err(`cd: not a directory: ${target}`);
      return { blocks: [], cwd: path };
    },
  },
  pwd: {
    usage: "pwd",
    summary: "where am I",
    group: "explore",
    run: (_a, ctx) => out(line("/" + ctx.state.cwd.join("/"))),
  },
  cat: {
    usage: "cat <file>",
    summary: "print a file",
    group: "explore",
    run: (args, ctx) => {
      if (!args.length) return err("usage: cat <file>   (try: cat about.md)");
      const blocks: Block[] = [];
      for (const a of args) {
        const { node } = lookup(ctx.root, ctx.state.cwd, a);
        if (!node) {
          blocks.push(line(s(`cat: ${a}: No such file or directory`, "red")));
          continue;
        }
        if (node.type === "dir") {
          blocks.push(
            line(s(`cat: ${a}: Is a directory. `, "red"), s(`ls ${a}`, "green", { cmd: `ls ${q(a)}` }), s(" instead?", "muted")),
          );
          continue;
        }
        const c = node.content;
        switch (c.kind) {
          case "markdown":
            blocks.push({ kind: "markdown", source: c.text });
            break;
          case "text":
            for (const l of c.text.split("\n")) blocks.push(line(l));
            break;
          case "image":
            blocks.push({ kind: "image", image: c.image });
            break;
          case "link":
            blocks.push(
              line("[InternetShortcut]"),
              line("URL=", s(c.url, "cyan", { href: c.url })),
            );
            break;
          case "exec":
            blocks.push(
              line(
                s(`cat: ${node.name}: binary file. Run it instead: `, "muted"),
                s(`./${node.name}`, "green", { cmd: c.command }),
              ),
            );
            break;
        }
      }
      return { blocks };
    },
  },
  open: {
    usage: "open <file|dir|url>",
    summary: "open photos, links, anything",
    group: "explore",
    run: (args, ctx) => {
      const target = args[0];
      if (!target) return err("usage: open <file|dir|url>   (try: open photos)");
      if (/^https?:\/\//.test(target) || target.startsWith("mailto:"))
        return { blocks: [line("opening ", s(target, "cyan", { href: target }), "…")], open: target };
      const { node, path } = lookup(ctx.root, ctx.state.cwd, target);
      if (!node) return err(`The file ${displayPath(resolvePath(ctx.state.cwd, target))} does not exist.`);
      if (node.type === "dir") {
        const images = sortedChildren(node).filter((c) => c.type === "file" && c.content.kind === "image") as FileNode[];
        if (images.length)
          return {
            blocks: images.flatMap((f): Block[] => (f.content.kind === "image" ? [{ kind: "image", image: f.content.image }] : [])),
          };
        return commands.ls.run([displayPath(path)], ctx);
      }
      const c = node.content;
      if (c.kind === "link")
        return { blocks: [line("opening ", s(c.label, "cyan", { href: c.url }), s(` (${c.url})`, "muted"), "…")], open: c.url };
      if (c.kind === "exec") return run(c.command, ctx);
      return commands.cat.run([displayPath(path)], ctx);
    },
  },
  tree: {
    usage: "tree [dir]",
    summary: "everything, as a tree",
    group: "explore",
    run: (args, ctx) => {
      const { flags, rest } = splitFlags(args);
      const target = rest[0] ?? ".";
      const { node, path } = lookup(ctx.root, ctx.state.cwd, target);
      if (!node) return err(`tree: ${target}: No such file or directory`);
      if (node.type !== "dir") return out(line(target));
      const blocks: Block[] = [line(s(target === "." ? displayPath(path) : target, "blue"))];
      let dirs = 0;
      let files = 0;
      // Track whether each ancestor was the last child, to draw the right rails.
      const lastAt: boolean[] = [];
      const draw = (d: DirNode, p: string[], depth: number) => {
        const kids = sortedChildren(d, flags.has("a"));
        kids.forEach((k, i) => {
          const last = i === kids.length - 1;
          lastAt[depth] = last;
          const rails = lastAt.slice(0, depth).map((l) => (l ? "    " : "│   ")).join("");
          const kp = [...p, k.name];
          blocks.push(line(s(rails + (last ? "└── " : "├── "), "muted"), nameSpan(k, relTo(ctx.state.cwd, kp))));
          if (k.type === "dir") {
            dirs++;
            draw(k, kp, depth + 1);
          } else files++;
        });
      };
      draw(node, path, 0);
      blocks.push(line(""), line(s(`${dirs} directories, ${files} files`, "muted")));
      return { blocks };
    },
  },
  grep: {
    usage: "grep <word> [dir]",
    summary: "search every file",
    group: "explore",
    run: (args, ctx) => {
      const { rest } = splitFlags(args);
      const [pattern, where = "."] = rest;
      if (!pattern) return err("usage: grep <word> [dir]   (try: grep spanish)");
      const { node, path } = lookup(ctx.root, ctx.state.cwd, where);
      if (!node) return err(`grep: ${where}: No such file or directory`);
      const needle = pattern.toLowerCase();
      const blocks: Block[] = [];
      const check = (n: FsNode, p: string[]) => {
        if (n.type !== "file" || (n.content.kind !== "markdown" && n.content.kind !== "text")) return;
        const rel = relTo(ctx.state.cwd, p);
        for (const l of n.content.text.split("\n")) {
          const at = l.toLowerCase().indexOf(needle);
          if (at < 0) continue;
          blocks.push(
            line(
              s(rel, "magenta", { cmd: `cat ${q(rel)}` }),
              s(":", "muted"),
              l.slice(0, at),
              s(l.slice(at, at + pattern.length), "red"),
              l.slice(at + pattern.length),
            ),
          );
        }
      };
      if (node.type === "dir") walk(node, path, (n, p) => check(n, p), true);
      else check(node, path);
      if (!blocks.length) return out(line(s(`no matches for "${pattern}"`, "muted")));
      return { blocks };
    },
  },
  net: {
    usage: "net",
    summary: "what your browser told me",
    group: "explore",
    run: () => ({
      blocks: [line(s("scanning…", "muted"))],
      async: async () => {
        const res = await fetch("/api/net", { cache: "no-store" });
        const d = (await res.json()) as {
          ip: string | null;
          geo: { city: string | null; region: string | null; country: string | null; timezone: string | null };
          userAgent: string | null;
          protocol: string;
        };
        const place = [d.geo.city, d.geo.region, d.geo.country].filter(Boolean).join(", ");
        const nav = typeof navigator !== "undefined" ? navigator : null;
        const scr = typeof screen !== "undefined" ? `${screen.width}×${screen.height} @${devicePixelRatio}x` : "";
        const row = (k: string, v: string | null | undefined) => line(s(k.padEnd(12), "green"), v || s("(unknown)", "muted"));
        return [
          row("ip", d.ip ?? "localhost"),
          row("location", place),
          row("timezone", d.geo.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone),
          row("language", nav?.language),
          row("screen", scr),
          row("cores", nav?.hardwareConcurrency ? String(nav.hardwareConcurrency) : null),
          row("browser", d.userAgent),
          line(""),
          line(
            s("that's what every site sees. full scan (ISP, WebRTC leaks, speed): ", "muted"),
            s("/net", "green", { href: "/net" }),
          ),
        ];
      },
    }),
  },

  // -------------------------------------------------------------- system
  whoami: {
    usage: "whoami",
    summary: "who are you",
    group: "system",
    run: () =>
      out(
        line("guest"),
        line(s("(I'm dayton. ", "muted"), s("cat about.md", "green", { cmd: "cat ~/about.md" }), s(" if you want to know more.)", "muted")),
      ),
  },
  clear: { usage: "clear", summary: "clear the screen", group: "system", run: () => ({ blocks: [], clear: true }) },
  history: {
    usage: "history",
    summary: "what you've typed",
    group: "system",
    run: (_a, ctx) =>
      out(...ctx.state.history.map((h, i) => line(s(String(i + 1).padStart(4) + "  ", "muted"), s(h, "fg", { cmd: h })))),
  },
  echo: { usage: "echo <text>", summary: "say something", group: "system", run: (args) => out(line(args.join(" "))) },
  date: { usage: "date", summary: "what time is it", group: "system", run: (_a, ctx) => out(line(ctx.now.toString().replace(/ GMT.*$/, ""))) },
  man: {
    usage: "man <command>",
    summary: "how a command works",
    group: "system",
    run: (args) => {
      const c = commands[args[0] ?? ""];
      if (!args[0]) return err("What manual page do you want?");
      if (!c) return err(`No manual entry for ${args[0]}`);
      return out(line(s(args[0].toUpperCase(), "bold")), line("  ", s(c.usage, "green")), line("  ", c.summary));
    },
  },
  which: {
    usage: "which <command>",
    summary: "",
    group: "system",
    hidden: true,
    run: (args) => out(...args.map((a) => (commands[a] ? line(`/bin/${a}`) : line(s(`${a} not found`, "red"))))),
  },
  exit: { usage: "exit", summary: "close the terminal", group: "system", run: () => ({ blocks: [line("logout")], exit: true }) },

  // -------------------------------------------------------------- fun (hidden)
  sudo: {
    usage: "sudo",
    summary: "",
    group: "fun",
    hidden: true,
    run: (args, ctx) => {
      if (args.join(" ").toLowerCase() === "hire dayton") {
        const r = commands.dm.run([], ctx);
        return { ...r, blocks: [line(s("permission granted. ", "green"), "great choice."), ...r.blocks] };
      }
      return err("guest is not in the sudoers file. This incident will be reported.");
    },
  },
  rm: { usage: "rm", summary: "", group: "fun", hidden: true, run: () => err("rm: read-only file system. nice try.") },
  vim: { usage: "vim", summary: "", group: "fun", hidden: true, run: () => out(line("you'd never get out. we're keeping you safe.")) },
  hello: { usage: "hello", summary: "", group: "fun", hidden: true, run: () => out(line("hey 👋  try ", s("neofetch", "green", { cmd: "neofetch" }))) },
};

const ALIASES: Record<string, string> = {
  dir: "ls",
  ll: "ls -l",
  la: "ls -a",
  "?": "help",
  nano: "vim",
  emacs: "vim",
  hi: "hello",
  hola: "hello",
  hire: "sudo hire dayton",
  email: "dm",
  mail: "dm",
  cls: "clear",
  logout: "exit",
  quit: "exit",
  bio: "about",
  me: "about",
  github: "open ~/links/github.url",
  linkedin: "open ~/links/linkedin.url",
  x: "open ~/links/x.url",
  twitter: "open ~/links/x.url",
  photos: "open ~/photos",
  game: "play",
  rust: "lab",
  flock: "lab",
  companys: "companies",
  company: "companies",
  work: "projects",
  site: "gui",
  web: "gui",
  startx: "gui",
};

// ------------------------------------------------------------------ run

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

function suggest(name: string): string | null {
  let best: string | null = null;
  let score = 3;
  for (const c of [...Object.keys(commands).filter((k) => !commands[k].hidden), ...Object.keys(ALIASES)]) {
    const d = levenshtein(name, c);
    if (d < score) {
      score = d;
      best = c;
    }
  }
  return best;
}

/** Run one command line. Supports `a && b` and `a; b`. */
export function run(input: string, ctx: Context): CommandResult {
  const parts = input.split(/\s*(?:&&|;)\s*/).filter(Boolean);
  if (parts.length > 1) {
    const combined: CommandResult = { blocks: [] };
    let state = ctx.state;
    for (const part of parts) {
      const r = runOne(part, { ...ctx, state });
      if (r.clear) combined.blocks = [];
      combined.blocks.push(...r.blocks);
      if (r.cwd) {
        state = { ...state, cwd: r.cwd };
        combined.cwd = r.cwd;
      }
      combined.clear ||= r.clear;
      combined.open ??= r.open;
      combined.navigate ??= r.navigate;
      combined.async ??= r.async;
      combined.exit ||= r.exit;
      if (r.blocks.some((b) => b.kind === "line" && b.spans[0]?.tone === "red")) break;
    }
    return combined;
  }
  return runOne(input, ctx);
}

function runOne(input: string, ctx: Context): CommandResult {
  const tokens = tokenize(input.trim());
  if (!tokens.length) return { blocks: [] };
  const [first, ...args] = tokens;
  let name = first;

  if (ALIASES[name]) return run([ALIASES[name], ...args.map(q)].join(" "), ctx);

  const cmd = commands[name] ?? commands[name.toLowerCase()];
  if (cmd) return cmd.run(args, ctx);

  // ./file — run an executable
  if (name.includes("/")) {
    const { node } = lookup(ctx.root, ctx.state.cwd, name);
    if (node?.type === "file" && node.content.kind === "exec") return run([node.content.command, ...args].join(" "), ctx);
    if (node?.type === "dir") return commands.cd.run([name], ctx);
    if (node) return err(`zsh: permission denied: ${name}`);
    return err(`zsh: no such file or directory: ${name}`);
  }

  // zsh AUTO_CD: typing a directory name goes there. Typing a file suggests cat.
  const { node } = lookup(ctx.root, ctx.state.cwd, name);
  if (node?.type === "dir") return commands.cd.run([name], ctx);
  if (node?.type === "file") {
    name = node.name;
    return out(
      line(s(`zsh: permission denied: ${name}`, "red")),
      line(s("did you mean ", "muted"), s(actionFor(node, name), "green", { cmd: actionFor(node, name) }), s("?", "muted")),
    );
  }

  const guess = suggest(name.toLowerCase());
  return out(
    line(s(`zsh: command not found: ${name}`, "red")),
    guess
      ? line(s("did you mean ", "muted"), s(guess, "green", { cmd: guess }), s("? or try ", "muted"), s("help", "green", { cmd: "help" }))
      : line(s("try ", "muted"), s("help", "green", { cmd: "help" })),
  );
}

// ------------------------------------------------------------------ tab completion

export interface Completion {
  /** The new input line. */
  value: string;
  /** Candidates to show when there's more than one. */
  options: string[];
}

function commonPrefix(xs: string[]) {
  if (!xs.length) return "";
  let p = xs[0];
  for (const x of xs) while (!x.toLowerCase().startsWith(p.toLowerCase())) p = p.slice(0, -1);
  return p;
}

export function complete(input: string, ctx: Pick<Context, "root" | "state">): Completion {
  const lastSpace = input.lastIndexOf(" ");
  const head = input.slice(0, lastSpace + 1);
  const word = input.slice(lastSpace + 1);
  const firstWord = !head.trim() || /(&&|;)\s*$/.test(head);

  if (firstWord && !word.includes("/")) {
    const names = [...Object.keys(commands).filter((k) => !commands[k].hidden), ...Object.keys(ALIASES)];
    const dirNode = getNode(ctx.root, ctx.state.cwd);
    const local = dirNode?.type === "dir" ? sortedChildren(dirNode).map((c) => (c.type === "dir" ? `${c.name}/` : c.name)) : [];
    const hits = [...new Set([...names, ...local])].filter((n) => n.startsWith(word)).sort();
    if (hits.length === 1) return { value: head + hits[0] + (hits[0].endsWith("/") ? "" : " "), options: [] };
    const p = commonPrefix(hits);
    return { value: head + (p.length > word.length ? p : word), options: hits.length > 1 ? hits : [] };
  }

  // complete a path
  const slash = word.lastIndexOf("/");
  const dirPart = slash >= 0 ? word.slice(0, slash + 1) : "";
  const partial = slash >= 0 ? word.slice(slash + 1) : word;
  const dirNode = getNode(ctx.root, resolvePath(ctx.state.cwd, dirPart || "."));
  if (!dirNode || dirNode.type !== "dir") return { value: input, options: [] };
  const hits = sortedChildren(dirNode, partial.startsWith("."))
    .filter((c) => c.name.toLowerCase().startsWith(partial.toLowerCase()))
    .map((c) => (c.type === "dir" ? `${c.name}/` : c.name));
  if (hits.length === 1) return { value: head + dirPart + hits[0] + (hits[0].endsWith("/") ? "" : " "), options: [] };
  const p = commonPrefix(hits);
  return { value: head + dirPart + (p.length > partial.length ? p : partial), options: hits.length > 1 ? hits : [] };
}
