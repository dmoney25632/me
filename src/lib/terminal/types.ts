// Shared types for the terminal. Everything in src/lib/terminal is pure
// (no React, no DOM) so it can be unit tested in tests/terminal.test.ts.

export type Tone =
  | "fg"
  | "muted"
  | "green"
  | "blue"
  | "cyan"
  | "yellow"
  | "magenta"
  | "red"
  | "bold";

/** A run of text. `cmd` makes it clickable (runs that command); `href` makes it a link. */
export interface Span {
  text: string;
  tone?: Tone;
  href?: string;
  cmd?: string;
  /** Clicking copies this to the clipboard. */
  copy?: string;
}

export interface ImageRef {
  src: string;
  alt: string;
  caption?: string;
}

/** One piece of command output. */
export type Block =
  | { kind: "line"; spans: Span[] }
  | { kind: "image"; image: ImageRef }
  | { kind: "markdown"; source: string }
  /** Picture on the left, lines on the right (neofetch). */
  | { kind: "card"; image: ImageRef; lines: Span[][] }
  /** A live, interactive thing drawn inline (the Rust flock). */
  | { kind: "widget"; widget: "flock"; birds: number };

// ---------------------------------------------------------------- filesystem

export type FileContent =
  | { kind: "text"; text: string }
  | { kind: "markdown"; text: string }
  | { kind: "image"; image: ImageRef }
  /** A shortcut that opens a URL (like a macOS .webloc). */
  | { kind: "link"; url: string; label: string }
  /** An "executable": running it runs this terminal command. */
  | { kind: "exec"; command: string; description: string };

export interface FileNode {
  type: "file";
  name: string;
  content: FileContent;
}

export interface DirNode {
  type: "dir";
  name: string;
  children: FsNode[];
}

export type FsNode = FileNode | DirNode;

// ---------------------------------------------------------------- profile

/** What `neofetch` shows. Supplied by src/content/filesystem.ts. */
export interface NeofetchCard {
  image: ImageRef;
  rows: { label: string; value: string; cmd?: string }[];
}

// ---------------------------------------------------------------- shell

export interface ShellState {
  /** Absolute path as segments, e.g. ["home", "dayton"]. */
  cwd: string[];
  history: string[];
}

export interface CommandResult {
  blocks: Block[];
  /** New working directory, if the command changed it. */
  cwd?: string[];
  /** Wipe the screen before printing. */
  clear?: boolean;
  /** Open a URL in a new tab (or mailto). */
  open?: string;
  /**
   * Work that takes time (network, crypto). Its result replaces this
   * command's `blocks`; `update` can show progress before then.
   */
  async?: (update: (blocks: Block[]) => void) => Promise<Block[]>;
  /** Ask for a secret: typed without echo, never saved to history. */
  ask?: { label: string; then: (answer: string) => CommandResult };
  /** Go to another page of the site in this tab. */
  navigate?: string;
  /** Close the terminal window. */
  exit?: boolean;
}

// ---------------------------------------------------------------- commands

export interface Context {
  root: DirNode;
  state: ShellState;
  now: Date;
  /** What `neofetch` prints. */
  card: NeofetchCard;
  /** Loads the Rust module. Defaults to fetching /wasm/kit.wasm. */
  kit?: () => Promise<import("../kit").Kit>;
  /** Cryptographically secure random bytes. Defaults to crypto.getRandomValues. */
  random?: (n: number) => Uint8Array;
}

export interface Command {
  usage: string;
  summary: string;
  group: "explore" | "about" | "tools" | "system" | "fun";
  hidden?: boolean;
  /** Arguments may be private (passwords, messages): mask them in history and on screen. */
  secret?: boolean;
  run: (args: string[], ctx: Context) => CommandResult;
}
