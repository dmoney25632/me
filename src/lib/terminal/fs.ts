import type { DirNode, FsNode } from "./types";

export const HOME = ["home", "dayton"];

/** Turn a path typed by the user into absolute segments. Doesn't check it exists. */
export function resolvePath(cwd: string[], input: string): string[] {
  let path = input.trim();
  let base: string[];
  if (path === "" || path === "~") return [...HOME];
  if (path.startsWith("~/")) {
    base = [...HOME];
    path = path.slice(2);
  } else if (path.startsWith("/")) {
    base = [];
  } else {
    base = [...cwd];
  }
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") base.pop();
    else base.push(part);
  }
  return base;
}

/** Find the node at an absolute path. Matches names case-insensitively as a fallback. */
export function getNode(root: DirNode, path: string[]): FsNode | null {
  let node: FsNode = root;
  for (const part of path) {
    if (node.type !== "dir") return null;
    const next: FsNode | undefined =
      node.children.find((c) => c.name === part) ??
      node.children.find((c) => c.name.toLowerCase() === part.toLowerCase());
    if (!next) return null;
    node = next;
  }
  return node;
}

/** Canonical (correctly-cased) path, assuming it exists. */
export function canonical(root: DirNode, path: string[]): string[] {
  const out: string[] = [];
  let node: FsNode = root;
  for (const part of path) {
    if (node.type !== "dir") break;
    const next: FsNode | undefined =
      node.children.find((c) => c.name === part) ??
      node.children.find((c) => c.name.toLowerCase() === part.toLowerCase());
    if (!next) break;
    out.push(next.name);
    node = next;
  }
  return out;
}

/** Path for display: /home/dayton/projects -> ~/projects */
export function displayPath(path: string[]): string {
  const inHome = HOME.every((p, i) => path[i] === p);
  if (inHome) {
    const rest = path.slice(HOME.length);
    return rest.length ? `~/${rest.join("/")}` : "~";
  }
  return "/" + path.join("/");
}

export const isHidden = (n: FsNode) => n.name.startsWith(".");

export function sortedChildren(dir: DirNode, all = false): FsNode[] {
  return dir.children
    .filter((c) => all || !isHidden(c))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

/** Rough "file size" for ls -l. */
export function sizeOf(node: FsNode): number {
  if (node.type === "dir") return 64 + node.children.length * 32;
  const c = node.content;
  switch (c.kind) {
    case "text":
    case "markdown":
      return new TextEncoder().encode(c.text).length;
    case "image":
      return 104_000 + c.image.src.length * 97;
    case "link":
      return c.url.length + 120;
    case "exec":
      return 8_192 + c.command.length * 64;
  }
}

/** Every path under a dir, depth-first, for tree/grep/find. */
export function walk(
  dir: DirNode,
  path: string[],
  visit: (node: FsNode, path: string[], depth: number) => void,
  all = false,
  depth = 0,
) {
  for (const child of sortedChildren(dir, all)) {
    const p = [...path, child.name];
    visit(child, p, depth);
    if (child.type === "dir") walk(child, p, visit, all, depth + 1);
  }
}
