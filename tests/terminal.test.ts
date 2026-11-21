import { describe, expect, it } from "vitest";
import { neofetchCard, root } from "@/content/filesystem";
import { companies, projects } from "@/content";
import { complete, run, tokenize, type Context } from "@/lib/terminal/commands";
import { HOME, displayPath, getNode, resolvePath } from "@/lib/terminal/fs";
import type { Block } from "@/lib/terminal/types";

const ctx = (cwd = HOME, history: string[] = []): Context => ({ root, state: { cwd: [...cwd], history }, now: new Date("2026-11-20T12:00:00Z"), card: neofetchCard });
const text = (blocks: Block[]) =>
  blocks
    .map((b) => (b.kind === "line" ? b.spans.map((s) => s.text).join("") : b.kind === "markdown" ? b.source : b.kind))
    .join("\n");

describe("paths", () => {
  it("resolves ~, relative, absolute and ..", () => {
    expect(resolvePath(HOME, "~")).toEqual(HOME);
    expect(resolvePath(HOME, "projects")).toEqual([...HOME, "projects"]);
    expect(resolvePath([...HOME, "projects"], "..")).toEqual(HOME);
    expect(resolvePath(HOME, "/etc/motd")).toEqual(["etc", "motd"]);
    expect(resolvePath([], "~/photos/./")).toEqual([...HOME, "photos"]);
    expect(resolvePath(HOME, "../../..")).toEqual([]);
  });

  it("displays home as ~", () => {
    expect(displayPath(HOME)).toBe("~");
    expect(displayPath([...HOME, "projects"])).toBe("~/projects");
    expect(displayPath(["etc"])).toBe("/etc");
    expect(displayPath([])).toBe("/");
  });
});

describe("tokenize", () => {
  it("splits on spaces and keeps quoted strings together", () => {
    expect(tokenize(`echo "hello  world" 'x y' z`)).toEqual(["echo", "hello  world", "x y", "z"]);
    expect(tokenize("  ls   -la ")).toEqual(["ls", "-la"]);
  });
});

describe("filesystem", () => {
  it("has a markdown file for every project", () => {
    for (const p of projects) expect(getNode(root, [...HOME, "projects", `${p.id}.md`])).not.toBeNull();
  });

  it("points every image at a file in /public/photos", () => {
    const photos = getNode(root, [...HOME, "photos"]);
    expect(photos?.type).toBe("dir");
    if (photos?.type === "dir")
      for (const f of photos.children) {
        expect(f.type === "file" && f.content.kind).toBe("image");
        if (f.type === "file" && f.content.kind === "image") expect(f.content.image.src).toMatch(/^\/photos\//);
      }
  });
});

describe("commands", () => {
  it("cd changes directory and rejects files and missing paths", () => {
    expect(run("cd projects", ctx()).cwd).toEqual([...HOME, "projects"]);
    expect(run("cd", ctx(["etc"])).cwd).toEqual(HOME);
    expect(text(run("cd nope", ctx()).blocks)).toContain("no such file or directory");
    expect(text(run("cd about.md", ctx()).blocks)).toContain("not a directory");
  });

  it("auto-cds when you type a directory name", () => {
    expect(run("writing", ctx()).cwd).toEqual([...HOME, "writing"]);
  });

  it("ls hides dotfiles unless -a", () => {
    expect(text(run("ls", ctx()).blocks)).not.toContain(".secrets");
    expect(text(run("ls -a", ctx()).blocks)).toContain(".secrets");
    expect(text(run("ls -la ~", ctx()).blocks)).toMatch(/drwxr-xr-x.*projects\//);
  });

  it("cat renders markdown, text and images", () => {
    expect(run("cat about.md", ctx()).blocks[0].kind).toBe("markdown");
    expect(text(run("cat contact.txt", ctx()).blocks)).toContain("github.com");
    expect(run("cat photos/dayton.jpg", ctx()).blocks[0].kind).toBe("image");
    expect(text(run("cat projects", ctx()).blocks)).toContain("Is a directory");
  });

  it("open on a folder of photos shows every photo", () => {
    const r = run("open photos", ctx());
    expect(r.blocks.length).toBeGreaterThan(1);
    expect(r.blocks.every((b) => b.kind === "image")).toBe(true);
  });

  it("has a file and a link for every company", () => {
    for (const c of companies) {
      expect(getNode(root, [...HOME, "companies", `${c.id}.md`])).not.toBeNull();
      expect(run(`open ~/companies/${c.id}.url`, ctx()).open).toBe(c.url);
    }
    expect(text(run("companies", ctx()).blocks)).toMatch(/Future 42[\s\S]*Corva[\s\S]*Rags Cleaning/);
  });

  it("projects lists featured ones first with a plain-English line", () => {
    const out = text(run("projects", ctx()).blocks);
    expect(out.indexOf("Iron Horizon")).toBeLessThan(out.indexOf("Model Clash"));
    expect(out).toContain(projects[0].oneLiner);
  });

  it("play opens the game", () => {
    expect(run("play", ctx()).open).toBe("https://tgf1.vercel.app");
    expect(run("./play", ctx()).open).toBe("https://tgf1.vercel.app");
    expect(run("game", ctx()).open).toBe("https://tgf1.vercel.app");
  });

  it("lab opens the Rust sim", () => {
    expect(run("lab", ctx()).navigate).toBe("/lab");
    expect(run("rust", ctx()).navigate).toBe("/lab");
    expect(run("./lab", ctx()).navigate).toBe("/lab");
  });

  it("neofetch is built from content", () => {
    const r = run("neofetch", ctx());
    expect(r.blocks[0].kind).toBe("card");
  });

  it("only lists the projects I want shown", () => {
    expect(projects.map((p) => p.id)).toEqual(["val", "iron-horizon", "flock", "evrcad", "model-clash"]);
  });

  it("keeps Evrcad vague: no repo link and no technical breakdown", () => {
    const md = getNode(root, [...HOME, "projects", "evrcad.md"]);
    expect(md?.type === "file" && md.content.kind === "markdown" ? md.content.text : "").toContain("HIPAA");
    const e = projects.find((p) => p.id === "evrcad")!;
    expect(e.links.code).toBeUndefined();
    expect(e.howItWorks).toBeUndefined();
  });

  it("lists experience, school, certifications and honors", () => {
    const out = text(run("cat experience.md", ctx()).blocks);
    for (const s of ["Dixon Glass", "Sandbox", "Brigham Young University", "Security+", "Palantir", "Eagle Scout"]) expect(out).toContain(s);
    expect(out).not.toContain("Peak Senior");
  });

  it("has every life photo in ~/photos", () => {
    expect(run("ls ~/photos", ctx()).blocks.length).toBeGreaterThan(0);
    expect(getNode(root, [...HOME, "photos", "skiing.jpg"])).not.toBeNull();
    expect(getNode(root, [...HOME, "photos", "fishing.jpg"])).not.toBeNull();
  });

  it("open on a link opens the URL", () => {
    expect(run("open links/github.url", ctx()).open).toMatch(/^https:\/\/github\.com\//);
    expect(run("github", ctx()).open).toMatch(/^https:\/\/github\.com\//);
  });

  it("chains with && and stops on errors", () => {
    const r = run("cd projects && ls", ctx());
    expect(r.cwd).toEqual([...HOME, "projects"]);
    expect(text(r.blocks)).toContain("model-clash.md");
    expect(run("cd nope && ls", ctx()).blocks).toHaveLength(1);
  });

  it("grep finds text across files", () => {
    expect(text(run("grep colombia", ctx()).blocks)).toMatch(/experience\.md:/);
  });

  it("suggests close commands for typos", () => {
    expect(text(run("nefetch", ctx()).blocks)).toContain("did you mean neofetch");
  });

  it("runs executables with ./", () => {
    const r = run("./net", ctx());
    expect(r.async).toBeTypeOf("function");
  });

  it("tree counts directories and files", () => {
    expect(text(run("tree", ctx()).blocks)).toMatch(/\d+ directories, \d+ files/);
  });
});

describe("tab completion", () => {
  it("completes commands", () => {
    expect(complete("neof", ctx()).value).toBe("neofetch ");
  });
  it("completes paths, adding / for directories", () => {
    expect(complete("cd proj", ctx()).value).toBe("cd projects/");
    expect(complete("cat projects/mod", ctx()).value).toBe("cat projects/model-clash.md ");
  });
  it("lists options when ambiguous", () => {
    const c = complete("cat ", ctx());
    expect(c.options.length).toBeGreaterThan(1);
  });
});
