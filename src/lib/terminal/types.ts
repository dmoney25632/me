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
  | { kind: "card"; image: ImageRef; lines: Span[][] };

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
  /** Output that needs the network; printed when it resolves. */
  async?: () => Promise<Block[]>;
  /** Go to another page of the site in this tab. */
  navigate?: string;
  /** Close the terminal window. */
  exit?: boolean;
}
